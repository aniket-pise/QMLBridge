/**
 * Represents an error that is triggered by malicious content or behavior.
 */
export class MaliciousException extends Error {
	constructor(message: string) {
		super(message);
		this.name = "MaliciousException";
	}
}
