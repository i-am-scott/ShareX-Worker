# ShareX-Worker
ShareX-Worker is a companion file sharing and URL shortening website for [ShareX](https://getsharex.com/) that runs on [CloudFlare Workers](https://www.cloudflare.com/developer-platform/products/workers/).



## Features
- Create & manage shares
	- Upload files
	- Shorten URLs
	- With ShareX or through the website
- Image zoomer
- Video player
- Monaco text editor
- Download ShareX custom uploader configs from the dashboard

## Setup
- You will need to link a credit card with CloudFlare, however normal usage of this will fall under the free tier.
- [Fork](https://github.com/aStonePenguin/ShareX-Worker/fork) this repository.
- Sign up for [CloudFlare](https://www.cloudflare.com/) and setup your domain there if you already haven't.
	- Navigate to your domain, "Security", "Security rules", make sure "Show all rule types" is enabled and finally click "Create rule" next to "Rate limiting rules"
		- Give it a name.
		- Click "Edit Expression" and paste the following: `(not http.request.uri.path contains "/assets")`.
		- Set "Requests" to 20 (you can raise this in the future if it's too low).
		- Set all other options to their default.
		- Click deploy.
		- **Do not skip this step, your site will be vulnerable to bruteforce attacks otherwise.**
	- Under "Storage & Databases" on the CloudFlare homepage open "KV" create a new KV namespace.
		- Make note of the ID for later.
	- Under "R2 Object Storage" on the CloudFlare homepage create a bucket, leave the settings as their defaults if you don't know what they do and give it a name.
		- Open the bucket you just created, head to the settings tab and connect a domain. Example: `r2.yourdomain.com`
		- Click "Add CORS policy" and add "https://yourdomain.com" under "AllowedOrigins" then save.

- Open `wrangler.jsonc` on your repository fork and change all settings with a "CHANGE THIS" comment beside them. You may change the optional settings at this time as well. Commit/save the file.
- Head back to the CloudFlare dashboard, navigate to "Workers & Pages", click "Create" and finally import the repository you created earlier **by connecting your GitHub account.** If you don't connect your GitHub account you won't be able to merge changes to update it. When prompted to "Configure your project" use the default settings.
	- Wait for your worker to build and deploy. This will take a few minutes.
	- Open the worker you just created, head to the settings tab and under "Variables and Secrets" add an [`API_KEY`](https://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#api_key---required) and [`SESSION_KEY`](https://github.com/aStonePenguin/ShareX-Worker/blob/master/README.md#session_key---required) as described below under settings.


## Settings:
Settings that are marked as optional do not need to be changed if you don't want to, do not remove them though.

### Domains & Routes

#### `Custom domain` - **Required**
- Set this to any domain or subdomain you have setup with CloudFlare.


### Variables and Secrets

#### `API_KEY` - **Required**
- **Save this as a secret!**
- This is your API key for using the website you'll need this later to login. Use a password generator, mash your keyboard or use [this](https://generate-random.org/api-key-generator?count=2&length=256&type=mixed-numbers) until you have something between 64 and 512 characters.


#### `R2_FOLDER_FORMAT` - ***Optional***
- Determines are files are structured in your R2 bucket. Internally this uses [Moment.js](https://momentjs.com/).

#### `R2_URL` - **Required**
- The URL to your R2 bucket you created during setup. Make sure to prefix it with https:// and do not add a trailing slash.- Example: https://r2.yourdomain.com

#### `SESSION_KEY` - **Required**
- **Save this as a secret!**
- This the secret key used to to sign session cookies. Use a password generator, mash your keyboard or use [this](https://generate-random.org/api-key-generator?count=2&length=256&type=mixed-numbers) until you have something between 256 and 512 characters.

#### `SESSION_TTL` - ***Optional***
- How long in seconds you will stay logged in. Default is 2 weeks.

#### `SHARE_SLUG_FILE_EXT` - ***Optional***
- true or false
- Determines whether to append the file extension of the file you have uploaded to the URL. Whether this is enabled or not share URLs with file extensions of any type will still load. Example: yourdomain.com/thisIsTheSlug.png or yourdomain.com/thisIsTheSlug

#### `SHARE_SLUG_LEN_MAX` - ***Optional***
- The max length of the url slug. Exmaple yourdomain.com/thisIsTheSlug

#### `SHARE_SLUG_LEN_MIN` - ***Optional***
- The min length of the url slu. Exmaple yourdomain.com/thisIsTheSlug

#### `SHARE_TTL` - ***Optional***
- How long to store files and shortened URLs for in seconds before automatically deleting them. Default is 2 weeks.
- Set this to 0 to never delete anything. Beware you may exceed the free plan limits for CloudFlare.


### Bindings

#### `KV namespace` - **Required**
- This is the KV namespace you created during setup. Use the ID you made note of during setup.

#### `R2 bucket`
- This is the name of the R2 bucket you created during setup.


### Trigger Events

#### `Cron` - ***Optional***
- How often expired shares are pruned. You do not need to change this unless you're uploading more 1,000 files an hour or have your shares set to expire in less than an hour. You will run into CloudFlares free tier limits if you lower this too much.


### Build
#### `Build configuration` - **Required - Use the values below, these should be there automatically**
- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy`
- **Path**: `/`


## Updating
- Simply sync your fork of this project on gituhub!


## Editing / Contributing
- Edit `wrangler.jsonc` with the settings above.
- Create a .dev.vars file with an api and sesssion key.

### Install
```sh
npm install
```
### Setup
```sh
npx wrangler types
```
### Run Locally
```sh
npm run dev
```
### Build
```sh
npm run build
```