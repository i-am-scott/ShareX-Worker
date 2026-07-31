export class Helpers {

	protected static fileSizeSuffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

	public static bytesToString(byteCount: number)
	{
		if (byteCount == 0)
			return '0' + Helpers.fileSizeSuffixes[0];

		const bytes = Math.abs(byteCount);
		const place = Math.floor(Math.log(bytes) / Math.log(1024));
		const num = Math.round(bytes / Math.pow(1024, place));
		return (Math.sign(byteCount) * num) + Helpers.fileSizeSuffixes[place];
	}

	protected static durationUnits: { unit: string, ms: number }[] = [
		{ unit: 'y', ms: 365 * 24 * 60 * 60 * 1000 },
		{ unit: 'mo', ms: 30 * 24 * 60 * 60 * 1000 },
		{ unit: 'w', ms: 7 * 24 * 60 * 60 * 1000 },
		{ unit: 'd', ms: 24 * 60 * 60 * 1000 },
		{ unit: 'h', ms: 60 * 60 * 1000 },
		{ unit: 'mi', ms: 60 * 1000 },
		{ unit: 's', ms: 1000 },
	];

	public static timeSpanToString(durationMs: number): string
	{
		const abs = Math.abs(durationMs);

		for (const { unit, ms } of Helpers.durationUnits)
		{
			if (abs >= ms)
				return Math.round(abs / ms) + unit;
		}

		return '0s';
	}

	public static isValidUrl(url: string)
	{
		try {
			const urlObj = new URL(url);

			return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
		}
		catch
		{
			return false;
		}
	}

	public static getFileExtension(fileName: string): string
	{
		return fileName.split('.').pop() || fileName;
	}

	public static isNewerVersion(oldVer: string, newVer: string)
	{
		const oldParts = oldVer.split('.');
		const newParts = newVer.split('.');

		for (var i = 0; i < newParts.length; i++) {
			const a = ~~newParts[i];
			const b = ~~oldParts[i];
			if (a > b) return true
			if (a < b) return false
		}

		return false
	}

	protected static htmlEscapes: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;'
	};

	public static escapeHtml(input: string): string
	{
		return input.replace(/[&<>"']/g, (char) => Helpers.htmlEscapes[char]);
	}
}