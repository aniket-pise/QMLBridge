/**
 * Converts a file size in bytes to a human-readable format (bytes, KB, MB).
 *
 * @param sizeInBytes - The size in bytes to be converted.
 * @returns A string representing the formatted size.
 */
function getFormattedSize(sizeInBytes: number): string {
	// Check if the size is greater than or equal to 1 MB (1024 * 1024 bytes)
	if (sizeInBytes >= 1024 * 1024) {
		// Convert to MB and format to 2 decimal places
		return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	// Check if the size is greater than or equal to 1 KB (1024 bytes)
	else if (sizeInBytes >= 1024) {
		// Convert to KB and format to 2 decimal places
		return `${(sizeInBytes / 1024).toFixed(2)} KB`;
	}

	// By default return in bytes
	else {
		// For sizes less than 1 KB, return the size in bytes
		return `${sizeInBytes} bytes`;
	}
}

export default getFormattedSize;
