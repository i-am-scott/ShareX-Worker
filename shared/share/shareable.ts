export interface Shareable {
	url?: string;
	fileName?: string;
	fileExtension?: string;
	filePath?: string;
	urlSlug?: string;
	storageUrl?: string;
	contentType?: string;
	contentSize?: number;
	contentMd5?: string,
	deletetionKey?: string;
	creationDate?: number,
	expirationTtl?: number,
	expiration?: number
}