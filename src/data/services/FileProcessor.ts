import JSZip from 'jszip';

import {
	UploadException,
	ArchiveException,
	DatabaseException,
	MetadataException,
	MaliciousException,
	FontDownloadException,
	FileProcessorException,
} from '../../utils/exceptions';

import FontDownloader from './FontDownload';
import QmlTransformer, { QmlDirectory, QmlValue, TransformationOptions } from './Transform';

/**
 * FileProcessor orchestrates the complete QtBridge file lifecycle.
 *
 * Responsibilities include:
 *   - Handling QtBridge file uploads and validation
 *   - Managing IndexedDB storage for files, assets, and metadata
 *   - Extracting and processing archived content
 *   - Transforming metadata into QML files
 *   - Coordinating optional font downloads
 *   - Providing progress updates and structured logging throughout the pipeline
 */
class FileProcessor {
	// In-memory cache of processed metadata used during QML transformation
	private metadata: { [key: string]: string } = {};

	// Active IndexedDB connection used for all persistent storage operations
	private db: IDBDatabase | null = null;

	/**
	 * Initializes the IndexedDB database used by the FileProcessor.
	 *
	 * This method opens an existing database or creates a new one if it does not exist.
	 * During the initial setup or version upgrade, required object stores are created
	 * to persist files and metadata used throughout the processing pipeline.
	 *
	 * This method must be called before performing any database operations.
	 *
	 * @returns Promise that resolves when the database connection is ready
	 * 
	 * @throws DatabaseException If the database cannot be opened or initialized
	 */
	public async initDB(): Promise<void> {
		return new Promise((resolve, reject) => {
			// Open (or create) the IndexedDB database with schema version 1
			const request = indexedDB.open('QMLBridgeDB', 1);

			// Handle database creation or schema upgrades
			request.onupgradeneeded = (event) => {
				// Obtain the database instance being upgraded or created
				const db = (event.target as IDBOpenDBRequest).result;

				// Create object store for binary and generated files
				db.createObjectStore('Files', { keyPath: 'name' });

				// Create object store for key-value metadata entries
				db.createObjectStore('Metadata', { keyPath: 'key' });
			};

			// Handle successful database initialization
			request.onsuccess = (event) => {
				// Cache the active database connection for future operations
				this.db = (event.target as IDBOpenDBRequest).result;

				// Resolve once the database is ready for use
				resolve();
			};

			// Handle database open or initialization failure
			request.onerror = () => {
				// Reject with a typed database exception
				reject(new DatabaseException('Failed to initialize IndexedDB.'));
			};
		});
	}

	/**
	 * Persists data into the specified IndexedDB object store.
	 *
	 * This method performs a write operation using a read–write transaction
	 * and either inserts or updates the provided record based on the store's
	 * configured key path.
	 *
	 * @param storeName - Target IndexedDB object store name
	 * @param data - Data record to be stored (must conform to store schema)
	 *
	 * @returns Promise that resolves when the data is successfully written
	 *
	 * @throws DatabaseException If the database is not initialized or the write fails
	 */
	private async saveToDB(storeName: string, data: any): Promise<void> {
		return new Promise((resolve, reject) => {
			// Ensure the database connection has been initialized
			if (!this.db) {
				return reject(new DatabaseException('Database not initialized.'));
			}

			// Create a read–write transaction for the target object store
			const transaction = this.db.transaction(storeName, 'readwrite');

			// Access the object store within the transaction
			const store = transaction.objectStore(storeName);

			// Insert or update the record in the object store
			const request = store.put(data);

			// Resolve once the write operation completes successfully
			request.onsuccess = () => resolve();

			// Handle write errors and propagate a typed exception
			request.onerror = (event) => {
				reject(
					new DatabaseException(
						(event.target as IDBRequest).error?.message as string
					)
				);
			};
		});
	}

	/**
	 * Retrieves a record from the specified IndexedDB object store by key.
	 *
	 * This method performs a read-only transaction and returns the stored
	 * record if it exists, or `undefined` if no matching entry is found.
	 *
	 * @param storeName - Target IndexedDB object store name
	 * @param key - Primary key identifying the record to retrieve
	 *
	 * @returns Promise that resolves with the retrieved record or `undefined`
	 *
	 * @throws DatabaseException If the database is not initialized or the read fails
	 */
	private async getFromDB(storeName: string, key: string): Promise<any> {
		return new Promise((resolve, reject) => {
			// Ensure the database connection has been initialized
			if (!this.db) {
				return reject(
					new DatabaseException('Database not initialized.')
				);
			}

			// Create a read-only transaction for safe data access
			const transaction = this.db.transaction(storeName, 'readonly');

			// Access the target object store within the transaction
			const store = transaction.objectStore(storeName);

			// Request the record associated with the provided key
			const request = store.get(key);

			// Resolve with the retrieved record (or undefined if not found)
			request.onsuccess = (event) => {
				resolve((event.target as IDBRequest).result);
			};

			// Handle read errors and propagate a typed exception
			request.onerror = (event) => {
				reject(
					new DatabaseException(
						(event.target as IDBRequest).error?.message as string
					)
				);
			};
		});
	}

	/**
	 * Normalizes and rethrows errors using the application's exception model.
	 *
	 * This method ensures that only known, explicitly handled exception types
	 * are propagated as-is. Any unexpected or unclassified errors are wrapped
	 * in a `MaliciousException` to prevent accidental leakage of internal
	 * implementation details and to enforce a consistent error surface.
	 *
	 * @param error - The original error thrown during processing
	 *
	 * @throws UploadException | ArchiveException | MetadataException |
	 *         DatabaseException | FontDownloadException | FileProcessorException |
	 *         MaliciousException
	 */
	private handleError(error: any): never {
		// List of explicitly supported and trusted exception types
		const knownExceptions = [
			UploadException,
			ArchiveException,
			MetadataException,
			DatabaseException,
			FontDownloadException,
			FileProcessorException,
		];

		// Rethrow known, intentional exceptions without modification
		if (knownExceptions.some(exception => error instanceof exception)) {
			throw error;
		}

		// Wrap all unknown or unexpected errors in a MaliciousException
		throw new MaliciousException(
			(error as Error)?.message || 'An unexpected error occurred.'
		);
	}

	/**
	 * Validates and stores an uploaded QtBridge file in IndexedDB.
	 *
	 * This method verifies the file format, reads the file as binary data,
	 * and persists both the file content and its original filename for
	 * downstream processing and safe download naming.
	 *
	 * @param file - User-selected file to upload
	 *
	 * @returns Promise that resolves when the file is successfully stored
	 *
	 * @throws UploadException If the file is not a valid QtBridge archive
	 * @throws DatabaseException If storage operations fail
	 * @throws MaliciousException For any unexpected or invalid error state
	 */
	public async uploadFileToStorage(file: File): Promise<void> {
		try {
			// Extract the file extension to validate the uploaded file type
			const fileExtension = file.name.split('.').pop()?.toLowerCase();

			// Derive the base filename without extension for later use
			const fileName = file.name.slice(
				0,
				-(fileExtension?.length ? fileExtension.length + 1 : 0)
			);

			// Validate that the uploaded file is a QtBridge archive
			if (fileExtension === 'qtbridge') {
				// Read the uploaded file as binary data
				const arrayBuffer = await file.arrayBuffer();

				// Persist the uploaded QtBridge file content in IndexedDB
				await this.saveToDB('Files', {
					name: 'UploadedFile',
					content: arrayBuffer,
				});

				// Persist the original filename for safe ZIP download naming
				await this.saveToDB('Metadata', {
					key: 'FileName',
					value: fileName,
				});
			} else {
				// Reject unsupported file types early with a clear error
				throw new UploadException(
					'Invalid file format. Please upload a valid QtBridge file.'
				);
			}
		} catch (error) {
			// Normalize and rethrow errors using centralized error handling
			throw this.handleError(error);
		}
	}

	/**
	 * Extracts the uploaded QtBridge archive and stores its contents in IndexedDB.
	 *
	 * This method retrieves the previously uploaded QtBridge file from storage,
	 * unzips all contained files into memory, persists the extracted data for
	 * downstream processing, and clears the original uploaded archive to reduce
	 * storage overhead.
	 *
	 * @returns Promise that resolves once extraction and persistence are complete
	 *
	 * @throws ArchiveException If no uploaded file is found or extraction fails
	 * @throws DatabaseException If database operations fail
	 * @throws MaliciousException For any unexpected error state
	 */
	private async unzipFile(): Promise<void> {
		try {
			// Retrieve the uploaded QtBridge archive from IndexedDB
			const uploadedFile = await this.getFromDB('Files', 'UploadedFile');

			// Ensure an uploaded file exists before attempting extraction
			if (!uploadedFile) {
				throw new ArchiveException(
					'No uploaded QtBridge file found. Please upload a file before extraction.'
				);
			}

			// Create a Blob from the stored binary content
			const blob = new Blob([uploadedFile.content]);

			// Load and parse the ZIP archive from the Blob
			const zip = await JSZip.loadAsync(blob);

			// Container to hold extracted file contents keyed by filename
			const extractedFiles: { [key: string]: Uint8Array } = {};

			// Iterate through each file entry in the archive
			for (const fileName of Object.keys(zip.files)) {
				// Extract file contents as a Uint8Array
				const fileContent = await zip.file(fileName)!.async('uint8array');

				// Store extracted file data in memory
				extractedFiles[fileName] = fileContent;
			}

			// Persist all extracted files for later processing stages
			await this.saveToDB('Files', {
				name: 'ExtractedFiles',
				content: extractedFiles,
			});

			// Clear the original uploaded archive to free storage space
			await this.saveToDB('Files', {
				name: 'UploadedFile',
				content: null,
			});
		} catch (error) {
			// Normalize and rethrow errors using centralized error handling
			throw this.handleError(error);
		}
	}

	/**
	 * Processes extracted archive contents to separate images and metadata.
	 *
	 * This method scans all previously extracted files, identifies supported
	 * image assets and the metadata file, persists them into IndexedDB for
	 * downstream transformation, and clears temporary extraction data to
	 * optimize storage usage.
	 *
	 * @returns Promise that resolves once images and metadata are successfully processed
	 *
	 * @throws FileProcessorException If extracted files are missing
	 * @throws MetadataException If metadata file is not found or invalid
	 * @throws DatabaseException If database operations fail
	 * @throws MaliciousException For any unexpected error state
	 */
	private async processImagesAndMetadata(): Promise<void> {
		try {
			// Retrieve extracted files from IndexedDB
			const extractedFiles = await this.getFromDB('Files', 'ExtractedFiles');

			// Ensure extracted files are available before processing
			if (!extractedFiles) {
				throw new FileProcessorException(
					'Extracted files not found. Unable to continue processing.'
				);
			}

			// Container for extracted image assets
			const images: { [key: string]: Uint8Array } = {};

			// Holder for parsed metadata content
			let metadataValue: any | undefined;

			// Iterate through all extracted files
			for (const [fileName, fileContent] of Object.entries(extractedFiles.content)) {
				// Identify and collect supported image formats
				if (/\.(png|jpe?g|gif|svg)$/i.test(fileName)) {
					images[fileName] = fileContent as Uint8Array;
				}
				// Identify and parse metadata file
				else if (fileName.endsWith('.metadata')) {
					metadataValue = JSON.parse(
						new TextDecoder().decode(fileContent as Uint8Array)
					);
				}
			}

			// Persist extracted images if any were found
			if (Object.keys(images).length > 0) {
				await this.saveToDB('Files', {
					name: 'Images',
					content: images,
				});
			}

			// Ensure metadata was successfully extracted and parsed
			if (metadataValue) {
				await this.saveToDB('Metadata', {
					key: 'Metadata',
					value: metadataValue,
				});
			} else {
				throw new MetadataException(
					'Metadata file not found in extracted archive.'
				);
			}

			// Remove temporary extracted files to free storage space
			await this.saveToDB('Files', {
				name: 'ExtractedFiles',
				content: null,
			});
		} catch (error) {
			// Normalize and rethrow errors using centralized error handling
			throw this.handleError(error);
		}
	}

	/**
	 * Loads processed metadata from IndexedDB into memory.
	 *
	 * This method retrieves the previously extracted and stored metadata
	 * from the `Metadata` object store and caches it in the class-level
	 * `metadata` property for use during QML transformation.
	 *
	 * @returns Promise that resolves once metadata is successfully loaded
	 *
	 * @throws MetadataException If no metadata is found in the database
	 * @throws DatabaseException If the database is not initialized or access fails
	 * @throws MaliciousException For any unexpected or invalid error state
	 */
	private async readMetadata(): Promise<void> {
		try {
			// Retrieve metadata entry from IndexedDB
			const metadata = await this.getFromDB('Metadata', 'Metadata');

			// Validate that metadata exists in storage
			if (metadata) {
				// Cache metadata in memory for downstream processing
				this.metadata = metadata.value;
			} else {
				// Metadata is missing — transformation cannot proceed
				throw new MetadataException('No metadata found.');
			}
		} catch (error) {
			// Normalize and rethrow errors using the centralized error handler
			throw this.handleError(error);
		}
	}

	/**
	 * Recursively counts all QML files within a nested directory structure.
	 * 
	 * This method traverses through all levels of a QmlDirectory object,
	 * counting both individual QML files at leaf nodes and recursively
	 * processing nested subdirectories to provide a complete file count.
	 * 
	 * @param qmlFiles - The QML directory structure to analyze, which may contain
	 *                   both file content strings and nested directory objects
	 * @returns The total number of QML files found in the directory and all its subdirectories
	 */
	private filesCount(qmlFiles: QmlDirectory): number {
		// Recursively counts the total number of QML files in a nested directory structure
		let count = 0;

		// Iterate through all values in the current directory level
		Object.values(qmlFiles).forEach((value: QmlValue) => {
			if (typeof value === 'object' && value !== null) {
				// Recursively count files in nested directories
				count += this.filesCount(value);
			} else {
				// Count leaf nodes as individual QML files
				count++;
			}
		});

		// Return the total count of QML files in this directory and all subdirectories
		return count;
	}

	/**
	 * Executes the complete QtBridge file processing pipeline.
	 *
	 * This method orchestrates all major processing stages, including:
	 *   - Validating and unzipping the uploaded QtBridge archive
	 *   - Extracting and caching metadata and image assets
	 *   - Reusing cached metadata when available to optimize performance
	 *   - Transforming metadata into QML files based on provided options
	 *   - Optionally downloading and storing required font families
	 *
	 * Throughout the process, it provides real-time progress updates (0–100)
	 * and detailed, user-friendly log messages for UI feedback and debugging.
	 *
	 * @param options - Configuration options controlling QML transformation and font handling
	 * @param progressCallback - Callback invoked with progress percentage updates (0–100)
	 * @param updateLogs - Callback used to emit human-readable status messages during processing
	 *
	 * @returns Promise that resolves when the entire processing pipeline completes successfully
	 *
	 * @throws UploadException | ArchiveException | MetadataException | DatabaseException |
	 *         FontDownloadException | FileProcessorException - Throws when any stage of the
	 * 				 processing pipeline fails
	 */
	public async startProcessing(
		options: TransformationOptions,
		progressCallback: (progress: number) => void,
		updateLogs: (message: string, refresh?: boolean) => void,
	): Promise<void> {
		try {
			// Check whether metadata already exists in IndexedDB
			if (!(await this.getFromDB('Metadata', 'Metadata'))) {
				// Log: No cached metadata found, full processing pipeline will run
				updateLogs('No cached metadata found. Starting full file processing...');

				// Log: Beginning unzip operation
				updateLogs('Extracting QtBridge archive...');

				// Unzip the uploaded QtBridge file and store extracted contents
				await this.unzipFile();

				// Update progress after successful extraction
				progressCallback(40);

				// Log: Archive extraction completed
				updateLogs('Archive extracted successfully.');

				// Log: Beginning metadata and asset processing
				updateLogs('Processing extracted metadata and assets...');

				// Process extracted images and metadata files
				await this.processImagesAndMetadata();

				// Update progress after metadata processing
				progressCallback(50);

				// Log: Initial processing phase completed
				updateLogs('Initial file processing completed.');
			} else {
				// Metadata already exists — skip unzip and preprocessing
				progressCallback(50);

				// Log: Reusing cached metadata for faster processing
				updateLogs('Cached metadata found. Skipping extraction and initial processing.');
			}

			// Log: Preparing to load metadata required for QML transformation
			updateLogs('Loading metadata for QML transformation...');

			// Read and cache metadata from IndexedDB into memory
			await this.readMetadata();

			// Update progress after metadata is successfully loaded
			progressCallback(60);

			// Log: Metadata successfully loaded and ready for transformation
			updateLogs('Metadata loaded successfully.');

			// Ensure metadata is available before starting transformation
			if (this.metadata) {
				// Log: Initializing QML transformer with user-selected options
				updateLogs('Initializing QML transformer with selected options...');

				// Create a new QML transformer instance
				const qmlTransformer = new QmlTransformer(options);

				// Log: Starting QML generation process
				updateLogs('Generating QML files from metadata...');

				// Transform metadata into QML file structures
				const qmlFiles = await qmlTransformer.startTransformation(this.metadata);

				// Update progress after successful QML generation
				progressCallback(70);

				// Log: QML generation completed with file count
				updateLogs(`QML generation complete: ${this.filesCount(qmlFiles)} file(s) created.`);

				// Log: Persisting generated QML files
				updateLogs('Saving generated QML files to database...');

				// Store generated QML files in IndexedDB
				await this.saveToDB('Files', { name: 'QmlFiles', content: qmlFiles });

				// Update progress after database write
				progressCallback(80);

				// Log: QML files successfully saved
				updateLogs('QML files successfully saved to database.');

				// Handle optional font downloading
				if (options.downloadFonts && qmlTransformer.fontBucket) {
					// Log: Font download phase initiated
					updateLogs(`Font download enabled. Processing ${qmlTransformer.fontBucket.size} font family(s)...`);

					// Initialize font downloader with active database connection
					const fontDownloader = new FontDownloader(this.db);

					// Counter to track how many font families have been processed
					let processedFonts = 0;

					// Total number of font families scheduled for download
					const totalFonts = qmlTransformer.fontBucket.size;

					// Download each required font family
					for (const fontFamily of qmlTransformer.fontBucket) {
						try {
							// Retrieve stored font data from IndexedDB
							const fontsObjectStore = await this.getFromDB('Files', 'Fonts');

							// Check whether the requested font family already exists in storage
							if (fontsObjectStore?.content && fontsObjectStore.content[fontFamily]) {
								// Log: Font already exists, skip download
								updateLogs(`${fontFamily} font family already exists, skipping download`);
							} else {
								// Download and store the missing font family
								await fontDownloader.downloadFont(fontFamily);

								// Log: Font successfully downloaded and stored
								updateLogs(`${fontFamily} font family downloaded`);
							}

							// Increment processed font counter after successful handling
							processedFonts++;

							// Update progress dynamically during font downloads (80–95%)
							progressCallback(80 + Math.round((processedFonts / totalFonts) * 15));
						} catch (error) {
							// Increment processed count even if this font failed, ensuring progress continues to advance
							processedFonts++;

							// Update progress despite failure to prevent UI stall
							progressCallback(80 + Math.round((processedFonts / totalFonts) * 15));

							// Log font download error but continue processing remaining fonts
							updateLogs(`${error}`);
						}
					}

					// Finalize font processing progress
					progressCallback(95);

					// Log: Font processing summary
					updateLogs(`Font processing completed: ${processedFonts}/${totalFonts} font family(s) downloaded.`);
				} else {
					// Log: Font download disabled or no fonts detected
					updateLogs('Font download disabled or no fonts detected. Skipping font processing.');

					// Check for previously stored fonts in database
					const existingFonts = await this.getFromDB('Files', 'Fonts');

					// Remove stale font data if present
					if (existingFonts?.content) {
						// Log: Clearing outdated font data
						updateLogs('Removing previously stored font data from database...');

						// Clear font data from IndexedDB
						await this.saveToDB('Files', { name: 'Fonts', content: null });

						// Log: Font data successfully cleared
						updateLogs('Stored font data cleared.');
					}

					// Update progress when skipping font phase
					progressCallback(95);
				}

				// Mark processing pipeline as fully complete
				progressCallback(100);

				// Log: Final success message indicating readiness for download
				updateLogs('Processing completed successfully. Files are ready for download.');
			} else {
				// Log: Critical error — metadata missing, transformation cannot proceed
				updateLogs('Processing failed: No metadata available for QML transformation.');
			}
		} catch (error) {
			// Re-throw any errors
			throw this.handleError(error);
		}
	}

	/**
	 * Creates a ZIP file of processed images, fonts, and QML files, and triggers
	 * automatic download. Provides real-time progress updates and detailed logging
	 * throughout the process.
	 * 
	 * @param progressCallback - Function to update UI progress percentage (0-100)
	 * @param updateLogs - Function to add log messages for tracking the ZIP creation process
	 */
	public async createAndDownloadZip(
		progressCallback: (progress: number) => void,
		updateLogs: (message: string, refresh?: boolean) => void,
	): Promise<void> {
		try {
			// Start progress at 0%
			progressCallback(0);

			// Log: ZIP archive creation starting
			updateLogs('Starting ZIP archive creation...');

			// Create a new JSZip instance
			const zip = new JSZip();

			/**
			 * Recursively traverses a QML directory structure and adds all QML files to a ZIP archive.
			 * 
			 * This helper function processes nested QML content by distinguishing between:
			 * - Leaf nodes (string content) which become individual .qml files
			 * - Directory nodes (objects) which create subfolders in the ZIP structure
			 * 
			 * The function preserves the original directory hierarchy within the ZIP archive
			 * and tracks the total number of files added for progress reporting.
			 * 
			 * @param content - The QML content to process, which may be a string or nested object structure
			 * @param folder - The current JSZip folder instance to add files to
			 * @param basePath - The accumulated path for nested directories (used internally for recursion)
			 * @returns Promise that resolves with the total number of QML files added in this branch
			 */
			const addQmlContentToZip = async (content: any, folder: JSZip, basePath: string = ''): Promise<number> => {
				// Counter for tracking total QML files added in this recursive branch
				let filesAdded = 0;

				// Process each key-value pair in the current content level
				for (const [key, value] of Object.entries(content as { [key: string]: any })) {
					if (typeof value === 'string') {
						// Leaf node: Create QML file with .qml extension
						folder.file(`${basePath}${key}.qml`, value);

						// Increment counter for each file created
						filesAdded++;
					} else if (typeof value === 'object' && value !== null) {
						// Nested directory: Create subfolder for organizational structure
						const subFolder = folder.folder(key);

						// Recursively process contents of subdirectory if folder creation succeeded
						if (subFolder) {
							filesAdded += await addQmlContentToZip(value, subFolder);
						}
					}
				}

				// Return total files added from this directory level and all subdirectories
				return filesAdded;
			};

			/**
			 * Retrieves and adds file content from a specific IndexedDB object store to the ZIP archive.
			 * 
			 * This function handles multiple file storage patterns:
			 * - Flat file structures with direct Uint8Array content
			 * - Nested directory structures with organizational subfolders
			 * - Special handling for QML files which maintain their directory hierarchy
			 * 
			 * The function supports optional folder grouping to organize different file types
			 * (e.g., images, fonts) within separate ZIP directories.
			 * 
			 * @param storeName - Name of the IndexedDB object store containing files to add
			 * @param folderName - Optional folder name within the ZIP for organizational grouping
			 * @returns Promise that resolves with a boolean indicating if any content was successfully added
			 * 
			 * @throws {DatabaseException} If the database read operation fails
			 */
			const addContentToZip = async (storeName: string, folderName?: string): Promise<boolean> => {
				// Fetch the content from the IndexedDB object store
				const store = await this.getFromDB('Files', storeName);

				// Track total files added to this folder for validation
				let filesAdded = 0;

				// Check if the store has content to add
				if (store?.content) {
					// Use folder name if specified, otherwise add to root ZIP directory
					const folder = folderName ? zip.folder(folderName) : zip;

					// Check if the folder is valid before attempting file operations
					if (folder) {
						// Special handling for QML files due to their nested directory structure
						if (storeName === 'QmlFiles') {
							// Recursively add QML files and directories to the ZIP archive
							filesAdded = await addQmlContentToZip(store.content, zip);
						} else {
							// Iterate through the content and add files to the ZIP
							for (const [fileName, fileData] of Object.entries(store.content as { [key: string]: any })) {
								// Handle binary file data stored as Uint8Array
								if (fileData instanceof Uint8Array) {
									// Add binary file to ZIP with preserved filename
									folder?.file(fileName, fileData, { binary: true });

									// Increment the file counter for this folder
									filesAdded++;

									// Skip further processing for this entry
									continue;
								}

								// Handle nested directory structures (objects containing files)
								if (typeof fileData === 'object') {
									// Create subfolder within ZIP for organizational grouping
									const subFolder = folder.folder(fileName);

									// Add files from subdirectory if subfolder was created successfully
									if (subFolder) {
										for (const [subFileName, subFileData] of Object.entries(fileData as { [key: string]: any })) {
											if (subFileData instanceof Uint8Array) {
												// Add binary file to subfolder with preserved filename
												subFolder.file(subFileName, subFileData, { binary: true });

												// Increment the total file counter
												filesAdded++;
											}
										}
									}

									// Continue to next file/directory in iteration
									continue;
								}
							}
						}
					}
				}

				// Return true if any files were added, false otherwise
				return filesAdded > 0;
			}

			// Initial progress update to 10%
			progressCallback(10);

			// Log: ZIP structure initialized
			updateLogs('ZIP structure initialized');

			// Flag to track if any content has been added
			let hasContent = false;

			// Log: Adding images to the ZIP
			updateLogs('Adding images to ZIP...');
			hasContent = await addContentToZip('Images', 'Images') || hasContent;

			// Check if images were added
			if (hasContent) {
				// Update progress to 20%
				progressCallback(20);

				// Log: Images added successfully
				updateLogs('Images added successfully');
			} else {
				// Log: No images found to add
				updateLogs('No images found to add');
			}

			// Log: Adding fonts to the ZIP
			updateLogs('Adding fonts to ZIP...');
			hasContent = await addContentToZip('Fonts', 'Fonts') || hasContent;

			// Check if fonts were added
			if (hasContent) {
				// Update progress to 30%
				progressCallback(30);

				// Log: Fonts added successfully
				updateLogs('Fonts added successfully');
			} else {
				// Log: No fonts found to add
				updateLogs('No fonts found to add');
			}

			// Log: Adding QML files to the ZIP
			updateLogs('Adding QML files to ZIP...');
			hasContent = await addContentToZip('QmlFiles') || hasContent;

			// Check if QML files were added
			if (hasContent) {
				// Update progress to 40%
				progressCallback(40);

				// Log: QML files added successfully
				updateLogs('QML files added successfully');
			} else {
				// Log: No QML files found to add
				updateLogs('No QML files found to add');
			}

			// Validate that at least some content was added
			if (!hasContent) {
				throw new ArchiveException('No content to add to the ZIP file.');
			}

			// Update progress to 50% before starting ZIP compression
			progressCallback(50);

			// Log: All files added to the ZIP structure, starting compression
			updateLogs('All files added to ZIP structure, starting compression...');

			// Generate ZIP blob with compression and progress tracking
			const zipBlob = await zip.generateAsync(
				{
					type: 'blob',
					compression: 'DEFLATE',
					compressionOptions: { level: 6 }
				},
				(metadata) => {
					// Map JSZip's 0-100 progress to our 50-90 range
					progressCallback(
						Math.round(
							50 + (metadata.percent * 40 / 100)
						),
					);
				}
			);

			// Update progress to 90% before triggering download
			progressCallback(90);

			// Log: ZIP compression completed, preparing download
			updateLogs('ZIP compression completed, preparing download...');

			// Trigger automatic download in the browser
			await this.triggerDownload(zipBlob);

			// Complete progress at 100%
			progressCallback(100);

			// Log: Download initiated successfully
			updateLogs('Download initiated successfully!');
		} catch (error) {
			// Re-throw any errors
			throw this.handleError(error);
		}
	}

	/**
	 * Triggers automatic download of a Blob by creating a temporary anchor element
	 * Generates a safe filename based on original file metadata or timestamp
	 * 
	 * @param blob - The blob to download (typically ZIP file content)
	 * @param fileName - The name for the downloaded file
	 */
	private async triggerDownload(blob: Blob): Promise<void> {
		// Create a temporary anchor element for download
		const downloadLink = document.createElement('a');

		// Create a URL for the blob to enable download
		const url = URL.createObjectURL(blob);

		// Set anchor href to the blob URL
		downloadLink.href = url;

		// Get current date and time for fallback filename
		const now = new Date();

		// Format a number to 2 digits with leading zero
		const pad = (n: number) => n.toString().padStart(2, '0');

		// Get the original filename from metadata stored in IndexedDB
		const fileNameObject = await this.getFromDB('Metadata', 'FileName');

		// Set download filename with safe formatting
		downloadLink.download = `${(fileNameObject && fileNameObject?.value)
			? fileNameObject?.value
				.replace(/[<>:"/\\|?*]/g, '')	// Remove illegal filename characters
				.replace(/[\/\0]/g, '')				// Remove null characters and slashes
				.replace(/[^\w\s-]/g, '')			// Remove special characters
				.replace(/\s+/g, '_')					// Replace spaces with underscores
				.replace(/\.qtbridge$/i, '')	// Remove .qtbridge extension
				.trim()
			: (
				// Fallback filename format: QMLBridge_YYYYMMDD - HHMMSS
				`QMLBridge_` +
				`${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())} -` +
				`${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
			)}.zip`;

		// Style the link to be hidden (not visible on page)
		downloadLink.style.display = 'none';

		// Add to DOM temporarily to enable download
		document.body.appendChild(downloadLink);

		// Programmatically click the link to trigger download
		downloadLink.click();

		// Clean up temporary resources after a short delay
		setTimeout(() => {
			// Remove the temporary anchor element from DOM
			document.body.removeChild(downloadLink);

			// Revoke the blob URL to free up memory
			URL.revokeObjectURL(url);
		}, 100);
	}

	/**
	 * Closes all active database connections and transactions.
	 * This ensures that no ongoing operations block database operations
	 * such as deletion, preventing errors like "Database deletion blocked."
	 * 
	 * Important: This method should be called before attempting to delete
	 * the database or when the FileProcessor is no longer needed.
	 */
	public closeConnections() {
		if (this.db) {
			// Close the database connection - automatically closes any
			// open transactions or cursors associated with this connection
			this.db.close();

			// Clear the database reference to prevent reuse
			this.db = null;
		}
	}

	/**
	 * Permanently deletes the entire IndexedDB database and all stored data.
	 * This operation removes all transformed files, metadata, and processed content.
	 * 
	 * @throws {DatabaseException} If deletion is blocked by open connections
	 * @returns {Promise<void>} Resolves when database is successfully deleted
	 */
	public async deleteDB(): Promise<void> {
		return new Promise((resolve, reject) => {
			// Request deletion of the database by name
			const request = indexedDB.deleteDatabase('QMLBridgeDB');

			// Success callback for database deletion
			request.onsuccess = () => {
				// Resolve the promise when deletion completes successfully
				resolve();
			};

			// Error callback for database deletion failures
			request.onerror = (event) => {
				// Reject with specific error message from IndexedDB
				reject(new DatabaseException((event.target as IDBRequest).error?.message as string));
			};

			// Blocked callback if deletion is prevented by open connections
			request.onblocked = () => {
				// Reject with instruction to close all database connections
				reject(new DatabaseException('Database deletion blocked. Close all connections.'));
			};
		});
	}
}

export default FileProcessor;
