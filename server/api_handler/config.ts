import { ApiHandler } from './api';

// https://getsharex.com/docs/custom-uploader

interface ShareXUploaderHeaders {
	API_KEY: string,
	FILE_NAME?: string,
	URL?: string
}

interface ShareXConfig {
	Version: string;
	Name: string;
	DestinationType: string,
	RequestMethod: string;
	RequestURL: string;
	Headers: ShareXUploaderHeaders;
	Body?: string;
	URL: string;
	DeletionURL: string;
	ErrorMessage: string;
}

export class ConfigHandler extends ApiHandler {
	protected baseConfig(name: string, destinationType: string, requestPath: string): Omit<ShareXConfig, 'Headers' | 'Body'>
	{
		return {
			Version: '17.0.0',
			Name: this.url.hostname + ' - ' + name,
			DestinationType: destinationType,
			RequestMethod: 'POST',
			RequestURL: this.url.origin + requestPath,
			URL: '{json:data.url}',
			DeletionURL: '{json:data.deletetionUrl}',
			ErrorMessage: '{json:error}'
		};
	}

	public exportUploader()
	{
		const config: ShareXConfig = {
			...this.baseConfig('Uploader', 'ImageUploader, TextUploader, FileUploader', '/api/upload'),
			Headers: {
				API_KEY: this.context.env.API_KEY,
				FILE_NAME: '{filename}'
			},
			Body: 'Binary',
		}

		return this.responseSuccess(config);
	}

	public exportShortener()
	{
		const config: ShareXConfig = {
			...this.baseConfig('Shortener', 'URLShortener', '/api/shorten'),
			Headers: {
				API_KEY: this.context.env.API_KEY,
				URL: '{input}'
			},
		}

		return this.responseSuccess(config);
	}
}

/*
{
  "Version": "17.0.0",
  "Name": "localhost - Shortener",
  "DestinationType": "URLShortener",
  "RequestMethod": "POST",
  "RequestURL": "http://localhost:5173/api/shorten",
  "Headers": {
    "API_KEY": "testkey",
    "URL": "{input}"
  },
  "URL": "{json:data.url}",
  "DeletionURL": "{json:data.deletetionUrl}",
  "ErrorMessage": "{json:error}"
}*/