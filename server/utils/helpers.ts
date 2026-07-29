import { Helpers as SharedHelpers } from '~/helpers';

import mime from 'mime-types';

class Helpers extends SharedHelpers {
	protected static chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	public static isDevMode(env: Env): boolean
	{
		return env.DEV_MODE === 'true';
	}

	public static randomChars(lenMin: number, lenMax: number): string
	{
		lenMin = Math.min(lenMin, lenMax);
		lenMax = Math.max(lenMax, lenMin);

		const len = Math.floor(Math.random() * (lenMax - lenMin + 1) + lenMin);

		let result = '';
		for (let i = 0; i < len; i++)
			result += this.chars.charAt(Math.floor(Math.random() * this.chars.length));

		return result;
	}

	public static async sha256(input: string) : Promise<string>
	{
		const digest = await crypto.subtle.digest(
			{
				name: 'SHA-256'
			},
			new TextEncoder().encode(input)
		);

		return Helpers.bufferToHex(digest);
	}

	public static getFileExtension(fileName: string): string
	{
		return fileName.split('.').pop() || fileName;
	}

	public static bufferToHex(buffer: ArrayBuffer): string
	{
		return [...new Uint8Array(buffer)]
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');
	}

	public static guessContentType(fileExtension: string): string|null
	{
		let newContentType = mime.lookup(fileExtension);

		if (newContentType)
			return newContentType;

		return null;
	}
}

export { Helpers }