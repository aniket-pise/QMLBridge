/**
 * Represents an error that occurs while handling metadata.
 */
export class MetadataException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MetadataException";
	}
}
