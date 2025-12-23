/**
 * Represents an error that occurs during file processing operations.
 */
export class FileProcessorException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FileProcessorException";
	}
}
