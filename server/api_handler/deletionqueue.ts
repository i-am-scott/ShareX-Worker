type DeletionQueueMetadata = {
	filePath: string,
	expirationTtl: number,
}

export class DeletionQueue {
	constructor(protected env: Env) { }

	public async add(urlSlug: string, metadata: DeletionQueueMetadata)
	{
		await this.env.KV.put('DeletionQueue:' + urlSlug, "", {
			metadata: {
				expirationTtl: Date.now() + (metadata.expirationTtl * 1000),
				filePath: metadata.filePath
			}
		});
	}

	public async proccess()
	{
		const objects = await this.env.KV.list({
			prefix: 'DeletionQueue:'
		})

		let count = 0;
		const fileQueue = [];
		const utcNow = Date.now();
		for (const object of objects.keys)
		{
			if (object.metadata == null)
				continue;

			const metadata = object.metadata as DeletionQueueMetadata;

			if (metadata.expirationTtl <= utcNow)
			{
				count++;

				fileQueue.push(metadata.filePath);
				await this.env.KV.delete(object.name); // bulk delete would be nice!

				if (count === 1000)
					break;
			}
		}

		if (count > 0)
		{
			console.log('Deleted ' + count + ' expired shares.');
			await this.env.R2.delete(fileQueue);
		}
	}
}