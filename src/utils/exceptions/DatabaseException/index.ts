/**
 * Represents an error that occurs within database operations.
 */
export class DatabaseException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "DatabaseException";
	}
}
