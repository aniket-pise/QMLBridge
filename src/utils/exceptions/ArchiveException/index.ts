/**
 * Represents an error that occurs during the archiving process.
 */
export class ArchiveException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ArchiveException";
	}
}
