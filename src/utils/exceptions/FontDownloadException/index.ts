/**
 * Represents an error that occurs during font download operations.
 */
export class FontDownloadException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FontDownloadException";
	}
}
