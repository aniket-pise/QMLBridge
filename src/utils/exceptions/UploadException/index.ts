/**
 * Represents an error that occurs during the upload process.
 */
export class UploadException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UploadException";
	}
}
