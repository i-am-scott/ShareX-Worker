import {
	ShareHandler,
	SessionHandler,
	ConfigHandler,
	DeletionQueue
} from './api_handler';

import {
	FileIcon,
	Helpers,
	OpenGraphTagGen
} from './utils';

import { Share } from '~/share';

import { Hono } from 'hono' // https://hono.dev/docs


// edit client/router/index.ts if changing this!
const urlSlugPath = '/:urlSlug{\[a-zA-Z0-9\.]{1,}}';
const getUrlSlug = (urlSlug: string) => urlSlug.split('.', 1).shift()!

type Variables = {
	isAuthed: boolean,
	sessionHandler: SessionHandler
}

const app = new Hono<{ Bindings: Env, Variables: Variables }>();

app.use(async (c, next) => {
	const env = c.env as any;

	// Do some idiot proofing.
	if (env.API_KEY == null)
		return c.text('API_KEY is not set!\nhttps://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#api_key---required', 503);

	if (env.API_KEY.length < 64 || env.API_KEY.length > 512)
		return c.text('API_KEY needs to be 64-512 characters!\nhttps://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#api_key---required', 503);

	if (env.SESSION_KEY == null)
		return c.text('SESSION_KEY is not set!\nhttps://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#session_key---required', 503);

	if (env.SESSION_KEY.length < 256 || env.SESSION_KEY.length > 512)
		return c.text('SESSION_KEY needs to be 256-512 characters!\nhttps://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#session_key---required', 503);

	if (env.SHARE_SLUG_LEN_MIN < 6)
		return c.text('SHARE_SLUG_LEN_MIN needs to be at least 6 characters!\nhttps://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#share_slug_len_min---optional', 503);

	if (env.SHARE_SLUG_LEN_MAX < env.SHARE_SLUG_LEN_MIN)
		return c.text('SHARE_SLUG_LEN_MAX needs to be greater than or equal to SHARE_SLUG_LEN_MIN!\nhttps://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#share_slug_len_max---optional', 503);


	const sessionHandler = new SessionHandler(c);
	const validSession = await sessionHandler.hasValidsession();

	c.set('sessionHandler', sessionHandler);
	c.set('isAuthed', validSession);

	return next();
});

// Pages
app.get(urlSlugPath, async (c) => {
	const { urlSlug } = c.req.param();

	const resp = await c.env.ASSETS.fetch(c.req.url);

	const share = new ShareHandler(c);
	const shareable = await share.get(getUrlSlug(urlSlug));

	if (shareable != null)
	{
		const share = Share.fromShareable(shareable);

		const isUrl = share.isUrl();

		// shortened url, redirect if not logged in
		if (isUrl && !c.var.isAuthed)
			return c.redirect(share.url!, 307);

		// embeded image/video, redirect to content
		if ((share.isImage() || share.isVideo()) && !c.req.header('Accept')?.includes('text/html'))
			return c.redirect(share.fileUrl!, 307);

		if (isUrl)
		{
			return resp;
		}
		else
		{
			const tagGen = new OpenGraphTagGen();

			const html = (await resp.text())
				.replace('<title>ShareX-Worker</title>', '<title>' + Helpers.escapeHtml(share.fileName!) + '</title>')
				.replace('/favicon.ico', '/fileicon/svg/' + Helpers.escapeHtml(share.fileExtension!) + '.svg')
				.replace('<meta property="og:title" content="Home"/>', tagGen.getTags(new URL(c.req.url), share));

			return c.html(html, resp);
		}

		// todo maybe embed data since we're fetching it anyway

	}

	return resp;
});
app.get('/fileicon/svg/:urlSlug', async (c) => {
	return FileIcon.create(getUrlSlug(c.req.param('urlSlug')));
});
app.get('/fileicon/png/:urlSlug', async (c) => {
	return FileIcon.createPng(getUrlSlug(c.req.param('urlSlug')));
});


// APIs
app.get('/api/get' + urlSlugPath, async (c) => {
	return await (new ShareHandler(c)).tryGet(c.req.param('urlSlug')!);
})
app.get('/api/delete'+ urlSlugPath + '/:deletionKey', async (c: any) => { // sharex will open this in browser!
	return await (new ShareHandler(c)).tryDelete(c.req.param('urlSlug'), c.req.param('deletionKey'));
});


// require an API key or cookie for all other api requests
app.use('/api/*', async (c, next) => {
	if (c.var.isAuthed)
		return next();

	return c.json({
		error: 'Invalid API credentials'
	}, 401)
});
app.post('/api/auth', async (c) => {
	return await c.var.sessionHandler.createSession();
});
app.post('/api/unauth', async (c) => {
	return await c.var.sessionHandler.deleteSession();
});
app.get('/api/list', async (c) => {
	c.header('Cache-Control', 'no-store');
	return await (new ShareHandler(c)).list();
});
app.post('/api/upload', async (c) => {
	return await (new ShareHandler(c)).tryUpload();
});
app.post('/api/delete' + urlSlugPath, async (c) => {
	return await (new ShareHandler(c)).tryDelete(c.req.param('urlSlug')!);
});
app.post('/api/shorten', async (c) => {
	return await (new ShareHandler(c)).tryShorten();
});
app.get('/api/export/upload', async (c) => {
	return new ConfigHandler(c).exportUploader();
});
app.get('/api/export/shorten', async (c) => {
	return new ConfigHandler(c).exportShortener();
});

// Simulate R2 for local dev
app.get('/r2/*', async (c) => {
	const env = c.env as any;
	if (!Helpers.isDevMode(env))
		return new Response('not allowed', { status: 403 })

	const key = c.req.path.substring('/r2/'.length)
	console.log("Local r2 key: ", key)
	const file = await c.env.R2.get(key)
	if (!file) throw new Response("file not found", { status: 404 })
	const headers = new Headers()
	headers.append('etag', file.httpEtag)
	if (file.httpMetadata?.contentType)
		headers.append('content-type', file.httpMetadata.contentType)
	return new Response(file.body, {
		headers,
	})
})


export default {
	fetch: app.fetch,
	async scheduled(event: any, env: Env, ctx: any) {
		await (new DeletionQueue(env)).proccess();
	},
}