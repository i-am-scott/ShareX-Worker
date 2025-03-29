import { defineStore } from 'pinia';
import { Http } from '@/utils/http';
import { Helpers } from '~/helpers';
import { Share } from '~/share';
import router from '@/router';
import type { ApiResponse } from '~/apiresponse';

// this is a simple app, we'll just manage most our state globally for simplicity
export const useApiStore = defineStore('api', {
	state: () => ({
		isAuthed: document.cookie.includes('auth_expire'),

		// obnoxious
		updateAvailable: false,
		updateVersion: undefined as string | undefined,

		// global load spiny!
		isPageLoaded: false,

		// options sidebar
		isOptionsActive: false,
		activeShare: undefined as Share | undefined,

		// todo: use these for an error popup
		error: false,
		errorMessage: '',
	}),
	actions:
	{
		// check updates
		async checkForUpdates()
		{
			if (this.isAuthed)
			{
				const nextUpdateCheck = localStorage.getItem('nextUpdateCheck');

				if (nextUpdateCheck == null || parseInt(nextUpdateCheck) <= Date.now())
				{
					const resp = await fetch("https://api.github.com/repos/aStonePenguin/ShareX-Worker/releases/latest")
					const data = await resp.json();

					if (data != null && data.tag_name)
					{
						this.updateVersion = data.tag_name;
						this.updateAvailable = Helpers.isNewerVersion(APP_VERSION, data.tag_name);

					}

					// annoy again in an hour
					const nextCheckDate = Date.now() + 3600000;

					localStorage.setItem('nextUpdateCheck', nextCheckDate.toString())
				}
			}
		},

		// apis
		async getShares()
		{
			const result: ApiResponse = await Http.get('list')

			// error checking here!

			return result.data;
		},

		async auth(apiKey: string)
		{
			const result: ApiResponse = await Http.post('auth', {
				headers: {
					API_KEY: apiKey
				}
			})

			if (result.error == null)
			{
				this.isAuthed = true;
				router.push('/')
			}

			// error checking here!
		},
		async unAuth()
		{
			const result: ApiResponse = await Http.post('unauth')

			if (result.error == null)
			{
				this.isAuthed = false;

				location.reload(); // eligant as always
			}

			// error checking here!
		},

		async getShare(urlSlug: string)
		{
			const result = await Http.get('get/' + urlSlug);

			if (result.error == null)
			{
				this.activeShare = Share.fromShareable(result.data);
			}
			else
			{
				this.activeShare = undefined;

				// error checking here!
			}
		},

		async uploadFile(file: File): Promise<any>
		{
			const result = await Http.post('upload', {
				headers: {
					FILE_NAME: file.name
				},
				body: file
			});


			// error checking here!

			return result.data;
		},

		async shortenUrl(url: string): Promise<any>
		{
			const result = await Http.post('shorten', {
				headers: {
					URL: url
				}
			});

			// error checking here!

			return result.data;
		},


		async downloadShareXConfig(uploader: boolean = true) // dumb
		{
			const result = await Http.get('export/' + (uploader ? 'upload' : 'shorten'));

			if (result.error == null)
			{
				const json = JSON.stringify(result.data, null, 4);
				const urlObject = window.URL.createObjectURL(new Blob([json], {type: 'application/json'}));

				this.downloadFile(result.data.Name + '.sxcu', urlObject)

				window.URL.revokeObjectURL(urlObject);
			}

			// error checking here!
		},

		// really dumb
		downloadFile(fileName: string, fileUrl: string)
		{
			const link = document.createElement('a');
			link.download = fileName;
			link.href = fileUrl;
			link.click();
			link.remove();
		},
	}
});