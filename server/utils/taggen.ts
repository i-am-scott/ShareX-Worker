import { Share } from '~/share';
import { Helpers } from './helpers';



export class OpenGraphTagGen {
	protected tags = '';

	protected addTag(property: string, content: string)
	{
		this.tags += '<meta property="' + property + '" content="' + content + '"/>\n';
	}

	protected addOgTag(property: string, content: string) // https://ogp.me/
	{
		this.addTag('og:' + property, content);
	}

	protected addXTag(property: string, content: string) // https://developer.x.com/en/docs/x-for-websites/cards/overview/markup
	{
		this.addTag('twitter:' + property, content);
	}

	// most embeds don't render svg previews, so use the png fileicon here
	protected addFileIconImageTag(url: URL, share: Share)
	{
		this.addOgTag('image', url.origin + '/fileicon/png/' + share.fileExtension + '.png');
		this.addOgTag('image:type:', 'image/png');
	}

	public getTags(url: URL, share: Share): string
	{
		this.addOgTag('title', share.fileName!);
		this.addOgTag('url', url.href);
		this.addOgTag('description', Helpers.bytesToString(share.contentSize ?? 0));

		if (share.isVideo())
		{
			this.addOgTag('type', 'video.other');
			this.addOgTag('video', share.fileUrl);
			this.addOgTag('video:type:', share.contentType!);

			this.addFileIconImageTag(url, share);
		}
		else if (share.isAudio())
		{
			// What do we pass for other audio??
			//this.addOgTag('type', 'video.other');
			this.addOgTag('audio', share.fileUrl);
			this.addOgTag('audio:type:', share.contentType!);

			this.addFileIconImageTag(url, share);
		}
		else if (share.isImage())
		{
			// Some sites such as Discord and Twitter obviously display the image in a larger format when this is set
			this.addXTag('card', 'summary_large_image');

			this.addOgTag('type', 'image');
			this.addOgTag('image', share.fileUrl);
			this.addOgTag('image:type:', share.contentType!);
		}
		else if (share.isText() || share.isFile())
		{
			this.addOgTag('type', 'website');
			this.addFileIconImageTag(url, share);
		}

		return this.tags
	}
}