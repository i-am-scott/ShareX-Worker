import type { Shareable } from '~/share';
import { ApiHandler } from './api'
import { Helpers } from '../utils';
import { DeletionQueue } from './deletionqueue';
import moment from 'moment';


export class ShareHandler extends ApiHandler {
	// Utility
	public async get(urlSlug: string): Promise<Shareable|null>
	{
		const shareable = await this.context.env.KV.get('Share:' + urlSlug, {
			type: 'json'
		});

		if (shareable == null)
			return null;

		// Simulate R2 for local dev
		if (Helpers.isDevMode(this.context.env))
			shareable.storageUrl = this.url.origin + '/r2';
		else
			shareable.storageUrl = this.context.env.R2_URL;

		return shareable as Shareable;
	}

	protected async set(shareable: Shareable)
	{
		await this.context.env.KV.put('Share:' + shareable.urlSlug, JSON.stringify(shareable), {
			expirationTtl: this.context.env.SHARE_TTL,
			metadata: { // duplicate this data into the metadata so we can have a history page
				url: shareable.url,
				urlSlug: shareable.urlSlug,
				fileName: shareable.fileName,
				creationDate: shareable.creationDate,
				contentSize: shareable.contentSize,
				deletetionKey: shareable.deletetionKey
			}
		});
	}

	protected async createUrlSlug(): Promise<string>
	{
		const urlSlug = Helpers.randomChars(this.context.env.SHARE_SLUG_LEN_MIN, this.context.env.SHARE_SLUG_LEN_MAX);

		const share = await this.get(urlSlug);
		if (share != null)
			return await this.createUrlSlug();

		return urlSlug;
	}



	// APIs Responsees
	public async list(): Promise<Response>
	{
		const data = await this.context.env.KV.list({
			prefix: 'Share:'
		})


		for (let i in data.keys) {
			data.keys[i] = data.keys[i].metadata;
		}

		data.keys.sort((a: any, b: any) => b.creationDate - a.creationDate);

		return this.responseSuccess(data.keys);
	}

	public async tryGet(urlSlug: string) : Promise<Response>
	{
		const shareData = await this.get(urlSlug);

		if (shareData == null)
			return this.responseError('Invalid share!', 404);

		// don't need to be passing this to the client!
		shareData.deletetionKey = undefined;

		return this.responseSuccess(shareData);
	}

	protected async removeShare(urlSlug: string, shareable: Shareable)
	{
		await this.context.env.KV.delete('Share:' + urlSlug)
		await this.context.env.KV.delete('DeletionQueue:' + urlSlug)
		await this.context.env.R2.delete(shareable.filePath)
	}

	public async tryDelete(urlSlug: string, deletetionKey?: string): Promise<Response>
	{
		const shareable = await this.get(urlSlug);

		if (shareable == null)
			return this.responseError('Invalid share!', 404);

		if (deletetionKey != null && shareable.deletetionKey !== deletetionKey)
			return this.responseError('Invalid deletion key!', 404);

		await this.removeShare(urlSlug, shareable);

		return this.responseSuccess(true);
	}

	public async tryBulkDelete(): Promise<Response>
	{
		const body = await this.context.req.json().catch(() => null) as { urlSlugs?: string[] } | null;

		if (!Array.isArray(body?.urlSlugs))
			return this.responseError('Missing urlSlugs!', 422);

		const results = await Promise.allSettled(body.urlSlugs.map(async (urlSlug) => {
			const shareable = await this.get(urlSlug);

			if (shareable == null)
				throw new Error('Invalid share!');

			await this.removeShare(urlSlug, shareable);
		}));

		const errors: Record<string, string> = {};

		results.forEach((result, i) => {
			if (result.status === 'rejected')
				errors[body.urlSlugs![i]] = result.reason instanceof Error ? result.reason.message : 'Failed to delete share';
		});

		return this.responseSuccess({ errors });
	}

	public async tryShorten(): Promise<Response>
	{
		const url = this.context.req.header('URL');
		if (url == null)
			return this.responseError('Missing URL header!', 422)

		if (!Helpers.isValidUrl(url))
			return this.responseError('Invalid URL!', 422)

		const urlSlug = await this.createUrlSlug();

		const shareable: Shareable = {
			url: url,
			urlSlug: urlSlug,
			deletetionKey: await Helpers.sha256(crypto.randomUUID()),
			creationDate: Date.now(),
			expirationTtl: this.context.env.SHARE_TTL
		}

		await this.set(shareable)

		return this.responseSuccess({
			url: this.url.origin + '/' + urlSlug,
			deletetionUrl: this.url.origin + '/api/delete/' + urlSlug + '/' + shareable.deletetionKey
		})
	}

	public async tryUpload(retries?: number): Promise<Response> {
		if (this.context.req.header('FILE_NAME') == null)
			return this.responseError('Missing FILE_NAME header!', 422)

		let fileName = this.context.req.header('FILE_NAME');
		if (retries != null)
			fileName = retries + '-' + fileName;

		const filePath = moment(new Date()).format(this.context.env.R2_FOLDER_FORMAT) + '/' + fileName;

		// Check if existing and retry with a name prefix if so
		const existingObject = await this.context.env.R2.get(filePath);
		if (existingObject != null && existingObject.body != null)
		{
			retries = (retries ?? 0) + 1;
			return await this.tryUpload(retries);
		}

		// Try upload
		const fileExtension = Helpers.getFileExtension(filePath);
		let contentType = this.context.req.header('content-type') || undefined;

		// ShareX doesn't do a great job of guessing the correct content type
		if (contentType == 'application/octet-stream')
			contentType = Helpers.guessContentType(fileExtension) ?? contentType;

		const buf = await this.context.req.arrayBuffer();

		if (buf.byteLength == 0)
		{
			return this.responseError('Cannot upload empty file!', 422);
		}

		const object = await this.context.env.R2.put(filePath, buf, {
			httpMetadata: {
				contentType: contentType
			}
		});

		if (object == null)
			return this.responseError('Failed to upload file to R2', 500);

		const urlSlug = await this.createUrlSlug();

		// Mimic S3 style presigned keys for deletion
		const deletetionKey = await Helpers.sha256(crypto.randomUUID());

		const shareable: Shareable = {
			fileName: fileName as string,
			fileExtension: fileExtension,
			filePath: filePath,
			urlSlug: urlSlug,
			contentType: contentType,
			contentSize: object.size,
			contentMd5: Helpers.bufferToHex(object.checksums.md5),
			deletetionKey: deletetionKey,
			creationDate: Date.now(),
			expirationTtl: this.context.env.SHARE_TTL
		}

		await this.set(shareable)

		// Add it to the deletion queue if we have a ttl set
		if (this.context.env.SHARE_TTL > 0)
		{
			await new DeletionQueue(this.context.env).add(urlSlug, {
				filePath: filePath,
				expirationTtl: this.context.env.SHARE_TTL,
			})
		}

		return this.responseSuccess({
			url: this.url.origin + '/' + urlSlug + (this.context.env.SHARE_SLUG_FILE_EXT ? ('.' + fileExtension) : ''),
			deletetionUrl: this.url.origin + '/api/delete/' + urlSlug + '/' + deletetionKey
		});
	}
}