import { DatabaseException, FontDownloadException } from "../../utils/exceptions";

// Interface representing a font family and its available file formats
interface Font {
	// The name of the font family (e.g., "Roboto", "Open Sans")
	family: string;

	// An object mapping font variants (e.g., "400", "700italic") to their respective URLs
	files: { [key: string]: string };
}

// Interface representing the response structure from the Google Fonts API
interface FontsResponse {
	// An array of font family objects returned by the API
	items: Font[];
}

// Mapping of font weight numbers to their corresponding human-readable names
const fontWeightNames: { [key: number]: string } = {
	100: 'Thin',
	200: 'ExtraLight',
	300: 'Light',
	400: 'Normal',
	500: 'Medium',
	600: 'SemiBold',
	700: 'Bold',
	800: 'ExtraBold',
	900: 'Black',
	950: 'ExtraBlack',
};

/**
 * FontDownloader class handles downloading font files from Google Fonts API
 * and storing them in IndexedDB for offline use during QML file generation.
 * 
 * Features:
 *   - Fetches font family metadata from Google Fonts API
 *   - Downloads font files in various formats (TTF, WOFF, WOFF2)
 *   - Formats font variants into readable filenames
 *   - Stores font data as Uint8Array binary format in IndexedDB
 *   - Supports multiple font families and variants
 */
class FontDownloader {
	// Google Fonts API URL with embedded API key for font metadata retrieval
	private apiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${import.meta.env.VITE_GOOGLE_FONTS_API_KEY}`;

	// Reference to the IndexedDB database connection for storing downloaded fonts
	private db: IDBDatabase | null = null;

	/**
	 * Constructs a FontDownloader instance with an IndexedDB connection.
	 * 
	 * @param db - The IDBDatabase instance for storing downloaded font data
	 */
	constructor(db: IDBDatabase | null) {
		// Assign the provided IndexedDB instance to the class property
		this.db = db;
	}

	/**
	 * Converts font weight and style combinations into readable filename strings.
	 * 
	 * Examples:
	 *   - "400" -> "Normal"
	 *   - "400italic" -> "NormalItalic"
	 *   - "700" -> "Bold"
	 * 
	 * @param weight - Font variant string (e.g., "400", "700italic", "300")
	 * @returns Formatted variant name for use in filenames
	 */
	private formatVariant(weight: string): string {
		// Match the numeric portion of the weight (e.g., "400" from "400italic")
		const numericMatch = weight.match(/(\d+)/);

		if (numericMatch) {
			// Convert the matched string to an integer
			const num = parseInt(numericMatch[0], 10);

			// Get human-readable weight name from mapping
			const name = fontWeightNames[num];

			// Extract style portion (e.g., "italic" from "400italic")
			const type = weight.replace(numericMatch[0], '');

			// Return the formatted variant (e.g., "NormalItalic")
			return `${name.charAt(0).toUpperCase() + name.slice(1)}${type.charAt(0).toUpperCase() + type.slice(1)}`;
		}

		// Return capitalized variant if no numeric portion found
		return weight.charAt(0).toUpperCase() + weight.slice(1);
	}

	/**
	 * Downloads a single font file from a URL and returns it as a Uint8Array.
	 * 
	 * @param url - URL of the font file to download
	 * @returns Promise resolving to Uint8Array containing the font binary data
	 * @throws FontDownloadException if the file download fails
	 */
	private async downloadFile(url: string): Promise<Uint8Array> {
		try {
			// Fetch font file from remote URL
			const response = await fetch(url);
			if (!response.ok) {
				// Throw an exception if the font file cannot be fetched
				throw new FontDownloadException('Failed to fetch font file.');
			}

			// Convert response to ArrayBuffer for binary processing
			const arrayBuffer = await response.arrayBuffer();

			// Return as Uint8Array for efficient binary storage
			return new Uint8Array(arrayBuffer);
		} catch (error) {
			// Preserve existing FontDownloadException instances
			if (error instanceof FontDownloadException) {
				throw error;
			}

			// Wrap unexpected errors in FontDownloadException
			throw new FontDownloadException((error as Error).message);
		}
	}

	/**
	 * Saves downloaded font files to IndexedDB under "Files > Fonts" object store.
	 * Fonts are stored by family name with each variant as a separate binary entry.
	 * 
	 * @param fontFamily - Name of the font family (e.g., "Roboto")
	 * @param data - Object mapping filenames to Uint8Array font data
	 * @throws DatabaseException if IndexedDB operations fail
	 */
	private async saveToDB(fontFamily: string, data: { [key: string]: Uint8Array }): Promise<void> {
		// Check if the IndexedDB reference is initialized
		if (!this.db) {
			// Throw an exception if IndexedDB is not initialized
			throw new DatabaseException('Database is not initialized.');
		}

		// Create read-write transaction for "Files" object store
		const transaction = this.db.transaction('Files', 'readwrite');
		const objectStore = transaction.objectStore('Files');

		return new Promise<void>((resolve, reject) => {
			// Retrieve existing font data from IndexedDB
			const getRequest = objectStore.get('Fonts');

			// Handle successful retrieval of existing font data
			getRequest.onsuccess = () => {
				// Merge new font data with existing data, preserving previous entries
				const existingData = getRequest.result || { name: 'Fonts', content: {} };

				// Add or update the font family with newly downloaded font variants
				existingData.content[fontFamily] = {
					...existingData.content[fontFamily],
					...data
				};

				// Save the updated font data back to IndexedDB
				const putRequest = objectStore.put(existingData);

				// Resolve the promise once the data is successfully saved
				putRequest.onsuccess = () => resolve();

				// Handle any errors that occur during the save process
				putRequest.onerror = (event) => {
					reject(new DatabaseException((event.target as IDBRequest).error?.message as string));
				};
			};

			// Handle errors that occur while retrieving existing font data
			getRequest.onerror = (event) => {
				reject(new DatabaseException((event.target as IDBRequest).error?.message as string));
			};
		});
	}

	/**
	 * Downloads a complete font family including all available variants (weights and styles).
	 * 
	 * This method performs the complete workflow:
	 *   1. Fetches font metadata from Google Fonts API
	 *   2. Locates the specified font family in the API response
	 *   3. Downloads all font files (variants) concurrently
	 *   4. Converts files to binary format
	 *   5. Stores all font data in IndexedDB under the "Fonts" object store
	 * 
	 * @param fontFamily - The name of the font family to download (e.g., "Roboto", "Open Sans")
	 * @returns Promise that resolves when all font files are downloaded and stored
	 * @throws FontDownloadException if the font family is not found, API fails, or download errors occur
	 * @throws DatabaseException if IndexedDB storage operations fail
	 */
	public async downloadFont(fontFamily: string): Promise<void> {
		try {
			// Fetch the list of fonts from the Google Fonts API
			const response = await fetch(this.apiUrl);
			if (!response.ok) {
				// Throw an exception if the response is not successful
				throw new FontDownloadException('Failed to fetch font family.');
			}

			// Parse the response as JSON and cast it to FontsResponse type
			const data: FontsResponse = await response.json();

			// Find the requested font family in the API response
			const font = data.items.find(item => item.family === fontFamily);
			if (!font) {
				// Throw an exception if the requested font family is not found
				throw new FontDownloadException(`Font family "${fontFamily}" not found.`);
			}

			// Object to store font files in base64 format with their file names
			const fontData: { [key: string]: Uint8Array } = {};

			// Download each font file, convert it to base64, and store it in fontData
			await Promise.all(
				Object.entries(font.files).map(async ([variant, fileUrl]) => {
					// Get the file extension from the URL (e.g., ".ttf", ".woff")
					const fileExtension = fileUrl.split('.').pop();

					// Format the file name by removing spaces from the font family name and appending the variant
					const fileName = `${fontFamily.replace(/\s+/g, '')}-${this.formatVariant(variant)}.${fileExtension}`;

					// Download the font file and convert it to base64 format
					const binaryData = await this.downloadFile(fileUrl);

					// Store the resulting font file as Uint8Array in the fontData object
					fontData[fileName] = binaryData;
				})
			);

			// Save the downloaded font files to IndexedDB under the specified font family
			await this.saveToDB(fontFamily, fontData);
		} catch (error) {
			// Preserve custom exception types
			if (error instanceof FontDownloadException || error instanceof DatabaseException) {
				throw error;
			}

			// Wrap unexpected errors in FontDownloadException
			throw new FontDownloadException((error as Error).message);
		}
	}
}

export default FontDownloader;
