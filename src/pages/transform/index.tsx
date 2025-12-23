import FileProcessor from '../../data/services/FileProcessor';

import { useEffect, useState } from 'react';
import { Page } from '../../common/components';
import { ColorsPalette } from '../../utils/constants/colors';
import { CheckBox, FilledButton, LogBox, OutlinedButton, UploadDialog } from '../../common/widgets';
import { useTheme } from '../../utils/theme';
import { TransformationOptionKey, TransformationOptions } from '../../data/services/Transform';

/** 
 * OperationType defines the possible states of the transformation process.
 * 	- 'idle': No operation is currently running
 * 	- 'transforming': File transformation is in progress
 * 	- 'downloading': Download package creation is in progress
 */
type OperationType = 'idle' | 'transforming' | 'downloading';

/** 
 * OperationState represents the current state of the file processing operation.
 * Includes the operation type and progress percentage (0-100)
 */
type OperationState = {
  // The type of operation being performed (e.g., 'idle', 'transforming', 'downloading')
  type: OperationType;

  // The current progress of the operation in percentage (0-100)
  progress: number;
};

/**
 * The `TransformPage` component serves as the main interface for users to upload a file, 
 * select various transformation options via checkboxes, and initiate a transformation process. 
 * The page layout is dynamically adjusted based on the screen width to ensure a responsive design.
 * It also allows users to view logs related to the transformation process.
 */
const TransformPage: React.FC = () => {
	// Retrieves the theme colors and current theme using the `useTheme` hook
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the current window width for dynamic layout adjustments
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// State to track if a file has been uploaded
	const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);

	// State to store log messages
	const [logs, setLogs] = useState<string[]>([]);

	// State to manage checkbox selections (with default values)
	const [checkboxStates, setCheckboxStates] = useState<TransformationOptions>({
		addIDs: false,
		addObjectNames: false,
		addUniqueIDs: false,
		downloadFonts: false,
	});

	// Unified operation state
	const [operationState, setOperationState] = useState<OperationState>({
		type: 'idle',
		progress: 0
	});

	// State for download availability - becomes true when transformation
	// completes successfully
	const [isDownloadReady, setIsDownloadReady] = useState(false);

	// Effect hook to handle window resizing and update windowWidth state
	useEffect(() => {
		// Function to update window width when the window is resized
		const handleResize = () => setWindowWidth(window.innerWidth);

		// Add event listener to handle resizing
		window.addEventListener('resize', handleResize);

		// Cleanup: Remove event listener when component is unmounted
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Effect hook to manage checkbox states based on interactions
	// If addUniqueIDs is checked, uncheck addIDs
	useEffect(() => {
		if (checkboxStates.addUniqueIDs) {
			setCheckboxStates(prev => ({ ...prev, addIDs: false }));
		}
	}, [checkboxStates.addUniqueIDs]);

	// If addIDs is checked, uncheck addUniqueIDs
	useEffect(() => {
		if (checkboxStates.addIDs) {
			setCheckboxStates(prev => ({ ...prev, addUniqueIDs: false }));
		}
	}, [checkboxStates.addIDs]);

	// Restore default states when no file is uploaded
	useEffect(() => {
		if (!isFileUploaded) {
			// Reset all checkbox options to their default (unchecked) state
			setCheckboxStates({
				addIDs: false,
				addObjectNames: false,
				addUniqueIDs: false,
				downloadFonts: false,
			});

			// Reset operation state to idle with 0 progress
			setOperationState({
				type: 'idle',
				progress: 0,
			});

			// Disable download readiness state
			setIsDownloadReady(false);
		}
	}, [isFileUploaded]);

	/** 
	 * Creates a log-updating callback.
	 * 
	 * If `refresh` is true, it replaces existing logs with the new message.
	 * Otherwise, it appends the message to the current log list.
	 */
	const updateLogs = (message: string, refresh: boolean = false) => {
		setLogs(refresh ? [message] : prev => [...prev, message]);
	};

	/** 
	 * Updates the progress percentage of the current operation
	 * @param progress - Progress percentage (0-100)
	 */
	const updateOperationProgress = (progress: number) => {
		setOperationState(prev => ({ ...prev, progress }));
	};

	// Function to handle checkbox state changes
	const handleCheckboxChange = (key: string) => (value: boolean) => {
		// Update the state for the specific checkbox
		setCheckboxStates(prev => ({ ...prev, [key]: value }));
	};

	/**
	 * Handles the file transformation process
	 * - Processes the uploaded file through the FileProcessor pipeline
	 * - Updates progress and logs in real-time
	 * - Enables download button when complete
	 */
	const handleTransform = async () => {
		// Validate that a file has been uploaded before starting transformation
		if (!isFileUploaded) {
			updateLogs('No file uploaded. Please upload a .qtbridge file first.');
			return;
		}

		// Initialize FileProcessor instance
		const fileProcessor = new FileProcessor();

		try {
			// Set operation state to transforming with initial progress
			setOperationState({ type: 'transforming', progress: 0 });

			// Update progress for initialization phase
			updateOperationProgress(10);

			// Log database initialization
			updateLogs('Initializing database connection...');

			// Initialize database for file processing
			await fileProcessor.initDB();

			// Update progress after database initialization
			updateOperationProgress(20);

			// Log successful database initialization
			updateLogs('Database initialized successfully');

			// Update progress before starting main processing
			updateOperationProgress(30);

			// Log selected options for transparency
			updateLogs('Starting file processing with selected options...');
			updateLogs(`  • Add Object Names: ${checkboxStates.addObjectNames ? 'Yes' : 'No'}`);
			updateLogs(`  • Add IDs: ${checkboxStates.addIDs ? 'Yes' : 'No'}`);
			updateLogs(`  • Add Unique IDs: ${checkboxStates.addUniqueIDs ? 'Yes' : 'No'}`);
			updateLogs(`  • Download Fonts: ${checkboxStates.downloadFonts ? 'Yes' : 'No'}`);

			// Start the main processing pipeline with selected options
			await fileProcessor.startProcessing(
				checkboxStates,
				updateOperationProgress,
				updateLogs,
			);

			// Enable download functionality after successful transformation
			setIsDownloadReady(true);
		} catch (error: any) {
			// Log any errors that occur during transformation
			updateLogs(`${error.message}`);
		} finally {
			// Reset operation state to idle after transformation completes or fails
			setOperationState({ type: 'idle', progress: 0 });

			// Clean up database connections and temporary resources
			fileProcessor.closeConnections();
		}
	};

	/**
	 * Handles downloading the transformed files as a ZIP archive
	 * - Creates a ZIP file with processed images, fonts, and QML files
	 * - Triggers browser download
	 * - Cleans up temporary URLs
	 */
	const handleDownload = async () => {
		// Validate if transformed files are ready for download
		if (!isDownloadReady) {
			updateLogs('No transformed files available for download');
			return;
		}

		// Initialize FileProcessor instance for file operations
		const fileProcessor = new FileProcessor();

		try {
			// Set operation state to downloading with initial progress
			setOperationState({ type: 'downloading', progress: 0 });

			// Initialize database for storing file metadata
			await fileProcessor.initDB();

			// Creates ZIP archive and trigger browser download with real-time
			// progress and logging updates
			await fileProcessor.createAndDownloadZip(
				updateOperationProgress,
				updateLogs,
			);
		} catch (error: any) {
			// Log any errors that occur during ZIP creation
			updateLogs(`Error creating download package: ${error.message}`);
		} finally {
			// Reset operation state to idle after download completes or fails
			setOperationState({ type: 'idle', progress: 0 });

			// Clean up database connections and temporary resources
			fileProcessor.closeConnections();
		}
	};

	/** 
	 * Determines if any processing operation is currently active
	 * Returns true if transformation or download is in progress
	 */
	const isProcessing = operationState.type === 'transforming' || operationState.type === 'downloading';

	return (
		<Page
			windowWidth={windowWidth}
			children={(
				// Main content section with responsive padding and overflow handling
				<main style={{
					flexGrow: 1,
					overflow: windowWidth > 599 ? 'auto' : 'unset',
					padding: windowWidth > 999 ? '40px 80px' : windowWidth > 599 ? '30px 40px' : '25px',
				}}>
					{/* Header Section with centered title and description */}
					<section style={{
						textAlign: 'center',
						maxWidth: windowWidth > 1199 ? '50%' : windowWidth > 599 ? '70%' : '100%',
						margin: 'auto',
						marginBottom: windowWidth > 999 ? '40px' : windowWidth > 599 ? '30px' : '25px',
					}}>
						{/* Page Title with theme-aware color */}
						<h1 style={{
							color: isDarkMode ? colors.Solid900 : colors.Solid800,
							margin: '0 0 12px 0',
							fontSize: '20px',
							fontWeight: '600',
						}}>File Transformation</h1>

						{/* Description text explaining the features and workflow */}
						<p style={{
							fontSize: '12px',
							color: isDarkMode ? colors.Solid800 : colors.Solid700,
							textAlign: 'center',
							margin: 0,
						}}>
							Upload your <b>.qtbridge</b> document, configure transformation parameters,
							and observe the entire operation through live progress indicators
							and comprehensive logging.
						</p>
					</section>

					{/* Content Container Section - Adapts layout based on file upload status */}
					<section style={{
						gap: '24px',
						display: 'grid',
						gridTemplateRows: (isProcessing || isDownloadReady) ? 'repeat(3, auto)' : (windowWidth > 1440) ? 'repeat(2, auto)' : 'auto',
						gridTemplateColumns: (isFileUploaded && (windowWidth > 1440)) ? 'repeat(2, 1fr)' : '1fr',
						maxWidth: windowWidth > 1199 ? (isFileUploaded ? '90%' : '70%') : (windowWidth > 599 ? '90%' : '100%'),
						margin: '0 auto',
					}}>
						{/* File Upload Section Container */}
						<div style={{ width: '100%' }}>
							<UploadDialog
								updateLogs={updateLogs}
								setIsFileUploaded={setIsFileUploaded}
							/>
						</div>

						{/* Options Card - Only shown when file is uploaded */}
						{isFileUploaded && (
							<div style={{
								width: '100%',
								overflow: 'hidden',
								userSelect: 'none',
								borderRadius: '16px',
								animation: 'slideUp 0.3s ease-out',
								border: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
								boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
								background: isDarkMode ? colors.Solid300 : colors.Solid100,
							}}>
								{/* Card Header Section with gradient background and settings icon */}
								<div style={{
									padding: '18px 20px',
									borderRadius: '16px 16px 0 0',
									borderBottom: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
									background: `linear-gradient(
										90deg,
										${isDarkMode ? colors.Solid300 : colors.Solid100} 0%,
										${colors.Solid200} 100%
									)`,
								}}>
									{/* Header Title Container with icon and text */}
									<h3 style={{
										gap: '14px',
										margin: 0,
										fontWeight: 600,
										display: 'flex',
										alignItems: 'center',
									}}>
										{/* Settings Icon - Visual representation of transformation options */}
										<svg
											width='20'
											height='20'
											viewBox='0 0 24 24'
											fill={isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime400}>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M14 4C14 4.55228 13.5523 5 13 5L3 5C2.44771 5 2 4.55228 2 4C2 3.44772 2.44771 3 3 3L13 3C13.5523 3 14 3.44772 14 4Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M12 19C12 19.5523 11.5523 20 11 20L3 20C2.44771 20 2 19.5523 2 19C2 18.4477 2.44771 18 3 18L11 18C11.5523 18 12 18.4477 12 19Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M22 19C22 19.5523 21.5523 20 21 20L17 20C16.4477 20 16 19.5523 16 19C16 18.4477 16.4477 18 17 18L21 18C21.5523 18 22 18.4477 22 19Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M22 11.5C22 12.0523 21.5523 12.5 21 12.5L11 12.5C10.4477 12.5 10 12.0523 10 11.5C10 10.9477 10.4477 10.5 11 10.5L21 10.5C21.5523 10.5 22 10.9477 22 11.5Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M22 4C22 4.55228 21.5523 5 21 5L19 5C18.4477 5 18 4.55228 18 4C18 3.44772 18.4477 3 19 3L21 3C21.5523 3 22 3.44772 22 4Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M6 11.5C6 12.0523 5.55228 12.5 5 12.5L3 12.5C2.44772 12.5 2 12.0523 2 11.5C2 10.9477 2.44772 10.5 3 10.5L5 10.5C5.55228 10.5 6 10.9477 6 11.5Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M16.75 3.47825C16.75 3.48548 16.75 3.49273 16.75 3.5L16.75 4.52176C16.75 4.73604 16.75 4.93288 16.7387 5.09821C16.7266 5.27585 16.699 5.47119 16.6168 5.6697C16.4392 6.0985 16.0985 6.43918 15.6697 6.61679C15.4712 6.69901 15.2759 6.72663 15.0982 6.73875C14.9329 6.75003 14.736 6.75002 14.5218 6.75L14.4782 6.75C14.264 6.75002 14.0671 6.75003 13.9018 6.73875C13.7241 6.72663 13.5288 6.69901 13.3303 6.61679C12.9015 6.43918 12.5608 6.0985 12.3832 5.6697C12.301 5.47119 12.2734 5.27585 12.2613 5.09821C12.25 4.93289 12.25 4.73604 12.25 4.52176L12.25 3.47824C12.25 3.26396 12.25 3.06712 12.2613 2.90179C12.2734 2.72415 12.301 2.52881 12.3832 2.33031C12.5608 1.90151 12.9015 1.56083 13.3303 1.38321C13.5288 1.30099 13.7241 1.27338 13.9018 1.26126C14.0671 1.24998 14.264 1.24999 14.4782 1.25C14.4855 1.25 14.4927 1.25 14.5 1.25C14.5073 1.25 14.5145 1.25 14.5218 1.25C14.736 1.24999 14.9329 1.24998 15.0982 1.26126C15.2759 1.27338 15.4712 1.30099 15.6697 1.38321C16.0985 1.56083 16.4392 1.90151 16.6168 2.33031C16.699 2.52881 16.7266 2.72415 16.7387 2.90179C16.75 3.06712 16.75 3.26397 16.75 3.47825Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M14.75 18.4782C14.75 18.4855 14.75 18.4927 14.75 18.5L14.75 19.5218C14.75 19.736 14.75 19.9329 14.7387 20.0982C14.7266 20.2759 14.699 20.4712 14.6168 20.6697C14.4392 21.0985 14.0985 21.4392 13.6697 21.6168C13.4712 21.699 13.2759 21.7266 13.0982 21.7387C12.9329 21.75 12.736 21.75 12.5218 21.75L12.4782 21.75C12.264 21.75 12.0671 21.75 11.9018 21.7387C11.7241 21.7266 11.5288 21.699 11.3303 21.6168C10.9015 21.4392 10.5608 21.0985 10.3832 20.6697C10.301 20.4712 10.2734 20.2759 10.2613 20.0982C10.25 19.9329 10.25 19.736 10.25 19.5218L10.25 18.4782C10.25 18.264 10.25 18.0671 10.2613 17.9018C10.2734 17.7241 10.301 17.5288 10.3832 17.3303C10.5608 16.9015 10.9015 16.5608 11.3303 16.3832C11.5288 16.301 11.7241 16.2734 11.9018 16.2613C12.0671 16.25 12.264 16.25 12.4782 16.25C12.4855 16.25 12.4927 16.25 12.5 16.25C12.5073 16.25 12.5145 16.25 12.5218 16.25C12.736 16.25 12.9329 16.25 13.0982 16.2613C13.2759 16.2734 13.4712 16.301 13.6697 16.3832C14.0985 16.5608 14.4392 16.9015 14.6168 17.3303C14.699 17.5288 14.7266 17.7241 14.7387 17.9018C14.75 18.0671 14.75 18.264 14.75 18.4782Z'
											/>
											<path
												fillRule='evenodd'
												clipRule='evenodd'
												d='M11.75 10.9782C11.75 10.9855 11.75 10.9927 11.75 11L11.75 12.0218C11.75 12.236 11.75 12.4329 11.7387 12.5982C11.7266 12.7759 11.699 12.9712 11.6168 13.1697C11.4392 13.5985 11.0985 13.9392 10.6697 14.1168C10.4712 14.199 10.2759 14.2266 10.0982 14.2387C9.93288 14.25 9.73603 14.25 9.52176 14.25L9.47824 14.25C9.26396 14.25 9.06711 14.25 8.90179 14.2387C8.72415 14.2266 8.52881 14.199 8.3303 14.1168C7.9015 13.9392 7.56082 13.5985 7.38321 13.1697C7.30099 12.9712 7.27337 12.7759 7.26125 12.5982C7.24997 12.4329 7.24998 12.236 7.25 12.0218L7.25 10.9782C7.24998 10.764 7.24997 10.5671 7.26125 10.4018C7.27337 10.2241 7.30099 10.0288 7.38321 9.83031C7.56082 9.40151 7.9015 9.06083 8.3303 8.88321C8.52881 8.80099 8.72415 8.77338 8.90179 8.76126C9.06712 8.74998 9.26396 8.74999 9.47824 8.75C9.48547 8.75 9.49273 8.75 9.5 8.75C9.50727 8.75 9.51452 8.75 9.52175 8.75C9.73603 8.74999 9.93288 8.74998 10.0982 8.76126C10.2759 8.77338 10.4712 8.80099 10.6697 8.88321C11.0985 9.06083 11.4392 9.40151 11.6168 9.83031C11.699 10.0288 11.7266 10.2241 11.7387 10.4018C11.75 10.5671 11.75 10.764 11.75 10.9782Z'
											/>
										</svg>

										{/* Section Title */}
										<p style={{
											margin: 0,
											fontSize: '14px',
											color: isDarkMode ? colors.Solid900 : colors.Solid600,
											fontWeight: '600',
										}}>Transformation Options</p>
									</h3>
								</div>

								{/* Options Grid Section - Contains user-selectable transformation options */}
								<div style={{ margin: '18px' }}>
									<OptionsGrid
										windowWidth={windowWidth}
										checkboxStates={checkboxStates}
										onCheckboxChange={handleCheckboxChange}
									/>
								</div>

								{/* Progress Bar Section - Displayed during processing operations */}
								{isProcessing && (
									<div style={{
										borderTop: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
										padding: '18px',
									}}>
										<div style={{
											padding: '14px 18px',
											borderRadius: '12px',
											border: `1px solid ${isDarkMode ? ColorsPalette.Lime800 : ColorsPalette.Lime300}`,
											background: `${isDarkMode ? ColorsPalette.Lime900 : ColorsPalette.Lime100}6A`,
										}}>
											{/* Progress Header - Contains status text and percentage */}
											<div style={{
												display: 'flex',
												justifyContent: 'space-between',
												marginBottom: '14px',
											}}>
												{/* Status Label - Shows current operation type */}
												<span style={{
													fontSize: '14px',
													fontWeight: 600,
													color: isDarkMode ? colors.Solid900 : colors.Solid700,
												}}>
													{/* Dynamic status text based on operation type */}
													{
														(() => {
															switch (operationState.type) {
																case 'transforming':
																	return 'Transforming...';
																case 'downloading':
																	return 'Creating Download Package...';
																default:
																	return 'Nothing To Do';
															}
														})()
													}
												</span>

												{/* Progress Percentage - Numeric representation of progress */}
												<span style={{
													fontSize: '14px',
													fontWeight: 600,
													color: isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime500,
												}}>
													{operationState.progress}%
												</span>
											</div>

											{/* Progress Bar Container - Visual progress indicator */}
											<div style={{
												height: '8px',
												background: `${isDarkMode ? colors.Solid700 : colors.Solid300}9F`,
												borderRadius: '4px',
												overflow: 'hidden',
											}}>
												{/* Progress Bar Fill - Dynamic width based on progress percentage */}
												<div style={{
													height: '100%',
													width: `${operationState.progress}%`,
													background: `linear-gradient(
														90deg,
														${isDarkMode ? ColorsPalette.Lime900 : ColorsPalette.Lime200},
														${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime500}
													)`,
													borderRadius: '4px',
													transition: 'width 0.3s ease',
												}} />
											</div>
										</div>
									</div>
								)}

								{/* Action Buttons and Status Section - Contains primary controls and status indicators */}
								<div style={{
									borderTop: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
									padding: '18px',
								}}>
									{/* Action Buttons Container - Transformation and download buttons */}
									<div style={{
										display: 'flex',
										gap: '12px',
										marginBottom: '18px',
										flexWrap: windowWidth > 1399 ? 'nowrap' : 'wrap',
									}}>
										{/* Transformation Button - Primary action for initiating file transformation */}
										<FilledButton
											child={
												<div style={{
													display: 'flex',
													alignItems: 'center',
													gap: '12px',
												}}>
													{/* Dynamic Icon - Changes based on operation state */}
													{operationState.type === 'transforming' ? (
														<svg
															width='18'
															height='18'
															viewBox='0 0 24 24'
															fill='currentColor'>
															<path d='M10.25 20.75C10.8023 20.75 11.25 21.1977 11.25 21.75C11.25 22.3023 10.8023 22.75 10.25 22.75H3.25C2.69772 22.75 2.25 22.3023 2.25 21.75C2.25 21.1977 2.69772 20.75 3.25 20.75H10.25ZM12.5 4.25C14.7033 4.25 16.7256 5.02159 18.3145 6.30762L19.1143 5.50879C19.4945 5.12864 20.111 5.12858 20.4912 5.50879C20.8714 5.889 20.8714 6.50549 20.4912 6.88574L19.6914 7.68457C20.978 9.27354 21.75 11.2962 21.75 13.5C21.75 18.6086 17.6086 22.75 12.5 22.75C12.4216 22.75 12.3435 22.7461 12.2656 22.7441C12.4139 22.444 12.5 22.1074 12.5 21.75C12.5 20.5464 11.5548 19.5664 10.3662 19.5059C10.4507 19.2693 10.5 19.0156 10.5 18.75C10.5 17.5464 9.55477 16.5664 8.36621 16.5059C8.45072 16.2693 8.5 16.0156 8.5 15.75C8.5 14.5074 7.49264 13.5 6.25 13.5H3.25C3.25 8.39137 7.39137 4.25 12.5 4.25ZM8.25 17.75C8.80228 17.75 9.25 18.1977 9.25 18.75C9.25 19.3023 8.80228 19.75 8.25 19.75H3.25C2.69772 19.75 2.25 19.3023 2.25 18.75C2.25 18.1977 2.69772 17.75 3.25 17.75H8.25ZM6.25 14.75C6.80228 14.75 7.25 15.1977 7.25 15.75C7.25 16.3023 6.80228 16.75 6.25 16.75H3.25C2.69772 16.75 2.25 16.3023 2.25 15.75C2.25 15.1977 2.69772 14.75 3.25 14.75H6.25ZM16.707 9.29297C16.3409 8.92685 15.7619 8.90426 15.3691 9.22461L15.293 9.29297L11.793 12.793C11.4026 13.1835 11.4025 13.8165 11.793 14.207C12.1835 14.5974 12.8165 14.5974 13.207 14.207L16.707 10.707L16.7754 10.6309C17.0957 10.2381 17.073 9.65909 16.707 9.29297ZM15 1.25C15.5523 1.25 16 1.69772 16 2.25C16 2.80228 15.5523 3.25 15 3.25H10C9.44772 3.25 9 2.80228 9 2.25C9 1.69772 9.44772 1.25 10 1.25H15Z' />
														</svg>
													) : (
														<svg
															width='18'
															height='18'
															viewBox='0 0 24 24'
															fill='currentColor'>
															<path
																fillRule='evenodd'
																clipRule='evenodd'
																d='M14.0775 1.40684C14.0969 1.41078 14.1163 1.41471 14.1356 1.41862C19.051 2.41192 22.75 6.76215 22.75 11.9779C22.75 17.9251 17.9391 22.75 12 22.75C6.06086 22.75 1.25 17.9251 1.25 11.9779C1.25 8.96549 2.48533 6.24004 4.47417 4.28594C4.85917 3.90766 5.47792 3.91312 5.85619 4.29811C6.23446 4.68311 6.22901 5.30186 5.84401 5.68013C4.21429 7.28139 3.20455 9.51037 3.20455 11.9779C3.20455 16.8498 7.14448 20.7955 12 20.7955C16.8555 20.7955 20.7955 16.8498 20.7955 11.9779C20.7955 7.70758 17.7671 4.14651 13.7485 3.33444C13.5394 3.29217 13.3788 3.25985 13.2402 3.23685C13.1358 3.2195 13.0614 3.21058 13.0072 3.2068C12.9802 3.3841 12.9773 3.64587 12.9773 4.14208V5.12156C12.9773 5.6613 12.5397 6.09884 12 6.09884C11.4603 6.09884 11.0227 5.6613 11.0227 5.12156V4.14208C11.0227 4.12198 11.0227 4.10186 11.0227 4.08172C11.0226 3.6595 11.0225 3.23306 11.0803 2.87884C11.1491 2.45724 11.317 2.01299 11.7385 1.66723C12.1355 1.34153 12.5698 1.24266 12.996 1.25042C13.336 1.25661 13.7205 1.33451 14.0775 1.40684Z'
															/>
															<path d='M7.52644 6.4184C7.79895 6.19652 8.18899 6.19361 8.46478 6.41139L13.8844 10.691C15.0335 11.5984 15.0395 13.3311 13.8964 14.2462C12.7602 15.1559 11.0637 14.7925 10.4103 13.4879L7.32938 7.33584C7.17202 7.02162 7.25393 6.64028 7.52644 6.4184Z' />
														</svg>
													)}

													{/* Button Text - Changes based on operation state */}
													<p style={{ margin: 0 }}>
														{operationState.type === 'transforming' ? 'Transforming...' : 'Initiate Transformation'}
													</p>
												</div>
											}
											enabled={isFileUploaded && !isProcessing}
											onPressed={handleTransform}
											textStyle={{
												fontSize: 14,
												fontWeight: 600,
											}}
											buttonStyle={{
												padding: '10px 14px',
												disabledColor: isDarkMode ? colors.Solid300A : colors.Solid200A,
												fixedSize: {
													width: 'fit-content',
													height: 'fit-content',
												},
											}}
										/>

										{/* Download Button - Secondary action for downloading transformed files */}
										<OutlinedButton
											child={
												<div style={{
													display: 'flex',
													alignItems: 'center',
													gap: '12px',
												}}>
													{/* Dynamic Icon - Changes based on operation state */}
													{operationState.type === 'downloading' ? (
														<svg
															width='18'
															height='18'
															viewBox='0 0 24 24'
															fill='currentColor'>
															<path d='M10.25 20.75C10.8023 20.75 11.25 21.1977 11.25 21.75C11.25 22.3023 10.8023 22.75 10.25 22.75H3.25C2.69772 22.75 2.25 22.3023 2.25 21.75C2.25 21.1977 2.69772 20.75 3.25 20.75H10.25ZM12.5 4.25C14.7033 4.25 16.7256 5.02159 18.3145 6.30762L19.1143 5.50879C19.4945 5.12864 20.111 5.12858 20.4912 5.50879C20.8714 5.889 20.8714 6.50549 20.4912 6.88574L19.6914 7.68457C20.978 9.27354 21.75 11.2962 21.75 13.5C21.75 18.6086 17.6086 22.75 12.5 22.75C12.4216 22.75 12.3435 22.7461 12.2656 22.7441C12.4139 22.444 12.5 22.1074 12.5 21.75C12.5 20.5464 11.5548 19.5664 10.3662 19.5059C10.4507 19.2693 10.5 19.0156 10.5 18.75C10.5 17.5464 9.55477 16.5664 8.36621 16.5059C8.45072 16.2693 8.5 16.0156 8.5 15.75C8.5 14.5074 7.49264 13.5 6.25 13.5H3.25C3.25 8.39137 7.39137 4.25 12.5 4.25ZM8.25 17.75C8.80228 17.75 9.25 18.1977 9.25 18.75C9.25 19.3023 8.80228 19.75 8.25 19.75H3.25C2.69772 19.75 2.25 19.3023 2.25 18.75C2.25 18.1977 2.69772 17.75 3.25 17.75H8.25ZM6.25 14.75C6.80228 14.75 7.25 15.1977 7.25 15.75C7.25 16.3023 6.80228 16.75 6.25 16.75H3.25C2.69772 16.75 2.25 16.3023 2.25 15.75C2.25 15.1977 2.69772 14.75 3.25 14.75H6.25ZM16.707 9.29297C16.3409 8.92685 15.7619 8.90426 15.3691 9.22461L15.293 9.29297L11.793 12.793C11.4026 13.1835 11.4025 13.8165 11.793 14.207C12.1835 14.5974 12.8165 14.5974 13.207 14.207L16.707 10.707L16.7754 10.6309C17.0957 10.2381 17.073 9.65909 16.707 9.29297ZM15 1.25C15.5523 1.25 16 1.69772 16 2.25C16 2.80228 15.5523 3.25 15 3.25H10C9.44772 3.25 9 2.80228 9 2.25C9 1.69772 9.44772 1.25 10 1.25H15Z' />
														</svg>
													) : (
														<svg
															width='18'
															height='18'
															viewBox='0 0 24 24'
															fill='currentColor'>
															<path d='M2.25008 16.75C2.25008 16.1978 2.6978 15.75 3.25008 15.75C3.80237 15.75 4.25008 16.1978 4.25008 16.75C4.25008 17.7444 4.25888 18.0453 4.31844 18.2676C4.50338 18.9578 5.04232 19.4968 5.73251 19.6817C5.95478 19.7412 6.25574 19.75 7.25008 19.75H16.7501L17.3751 19.7481C17.8899 19.7429 18.1009 19.7264 18.2677 19.6817C18.9578 19.4968 19.4968 18.9578 19.6817 18.2676C19.7413 18.0453 19.7501 17.7444 19.7501 16.75C19.7501 16.1978 20.1978 15.75 20.7501 15.75C21.3024 15.75 21.7501 16.1978 21.7501 16.75C21.7501 17.6156 21.7582 18.2445 21.6134 18.7852C21.2435 20.1656 20.1656 21.2435 18.7852 21.6133C18.2445 21.7582 17.6157 21.75 16.7501 21.75H7.25008C6.3845 21.75 5.75565 21.7582 5.21493 21.6133C3.83456 21.2435 2.75667 20.1656 2.3868 18.7852C2.24192 18.2445 2.25008 17.6156 2.25008 16.75Z' />
															<path d='M12 2.25009C11.4477 2.25009 11 2.6978 11 3.25009V13.8595C10.6959 13.5544 10.3742 13.2061 10.0605 12.8448C9.5874 12.2999 9.14786 11.7515 8.82518 11.338C8.66425 11.1318 8.39588 10.7768 8.30565 10.6573C7.97823 10.2127 7.35189 10.1172 6.90721 10.4444C6.46264 10.7718 6.36714 11.3982 6.69432 11.8429C6.78996 11.9695 7.07974 12.3528 7.24803 12.5684C7.58372 12.9986 8.04638 13.5755 8.54979 14.1554C9.04902 14.7304 9.60862 15.3311 10.1348 15.796C10.3967 16.0274 10.6741 16.2467 10.9502 16.4132C11.1989 16.5631 11.5734 16.7501 12 16.7501C12.4266 16.7501 12.8011 16.5631 13.0498 16.4132C13.3259 16.2467 13.6033 16.0274 13.8652 15.796C14.3913 15.3311 14.9509 14.7303 15.4502 14.1554C15.9536 13.5755 16.4162 12.9986 16.7519 12.5684C16.9202 12.3528 17.21 11.9695 17.3056 11.8429C17.6328 11.3982 17.5373 10.7728 17.0928 10.4454C16.6481 10.1179 16.0218 10.2126 15.6943 10.6573C15.6041 10.7768 15.3357 11.1318 15.1748 11.338C14.8521 11.7514 14.4126 12.2999 13.9394 12.8448C13.6258 13.206 13.3041 13.5544 13 13.8595V3.25009C13 2.69781 12.5523 2.25011 12 2.25009Z' />
														</svg>
													)}

													{/* Button Text - Changes based on operation state */}
													<p style={{ margin: 0 }}>
														{operationState.type === 'downloading' ? 'Creating Package...' : 'Download File'}
													</p>
												</div>
											}
											enabled={isDownloadReady && !isProcessing}
											onPressed={handleDownload}
											textStyle={{
												color: isDarkMode ? ColorsPalette.Lime500 : ColorsPalette.Lime600,
												fontSize: 14,
												fontWeight: 600,
											}}
											buttonStyle={{
												padding: '10px 14px',
												disabledColor: isDarkMode ? colors.Solid300A : colors.Solid200A,
												fixedSize: {
													width: 'fit-content',
													height: 'fit-content',
												},
											}}
										/>
									</div>

									{/* Status Indicators Container - Visual feedback for workflow state */}
									<div style={{
										display: 'flex',
										gap: '12px',
										flexWrap: 'wrap',
									}}>
										{/* File Ready Status Indicator - Shows if a file has been uploaded */}
										<StatusIndicator
											active={isFileUploaded}
											label='File Ready'
											color={isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime500}
										/>

										{/* Options Selected Status Indicator - Shows if any transformation options are selected */}
										<StatusIndicator
											active={Object.values(checkboxStates).some(v => v)}
											label='Options Selected'
											color={isDarkMode ? ColorsPalette.Teal600 : ColorsPalette.Teal500}
										/>

										{/* Download Ready Status Indicator - Shows if transformed files are ready for download */}
										<StatusIndicator
											active={isDownloadReady}
											label='Ready for Download'
											color={isDarkMode ? ColorsPalette.Purple600 : ColorsPalette.Purple500}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Log Box Section - Shows when processing or download is ready */}
						{(isProcessing || isDownloadReady) && (
							<div style={{
								gridColumn: ((windowWidth > 1440) && isFileUploaded) ? 'span 2' : 'unset',
							}}>
								<LogBox logs={logs} />
							</div>
						)}
					</section>
				</main>
			)}
		/>
	);
};

/**
 * OptionsGrid Component
 * 
 * A responsive, theme-aware grid of transformation option cards with interactive styling.
 * Each card represents a configuration option with a checkbox, label, and description.
 * Features smooth animations, hover effects, and proper accessibility patterns.
 */
const OptionsGrid: React.FC<{
	windowWidth: number;
	checkboxStates: TransformationOptions;
	onCheckboxChange: (key: string) => (value: boolean) => void;
}> = ({ windowWidth, checkboxStates, onCheckboxChange }) => {
	// Retrieves the current theme and color palette from theme context
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode for conditional styling
	const isDarkMode = theme === 'dark';

	// Breakpoint constant for mobile devices - disables hover effects on touch devices
	const isMobile = windowWidth <= 599;

	// Array of transformation options with metadata for display and behavior
	const options: {
		key: TransformationOptionKey;
		label: string;
		description: string;
	}[] = [
			{
				key: 'addObjectNames',
				label: 'Add Object Names',
				description: 'Include object names in output',
			},
			{
				key: 'addIDs',
				label: 'Add IDs',
				description: 'Generate sequential IDs',
			},
			{
				key: 'addUniqueIDs',
				label: 'Add Unique IDs',
				description: 'Generate unique UUIDs',
			},
			{
				key: 'downloadFonts',
				label: 'Download Fonts',
				description: 'Include font assets',
			},
		];

	return (
		<div style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(192px, 1fr))',
			gap: '16px',
		}}>
			{options.map(({ key, label, description }) => (
				<div
					key={key}
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: '14px 8px',
						borderRadius: '8px',
						border: `1px solid ${isDarkMode ? colors.Solid600 : colors.Solid400}`,
						transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
						cursor: 'pointer',
						...(
							checkboxStates[key]
								? {
									// Active state: teal border with semi-transparent teal background
									borderColor: isDarkMode ? ColorsPalette.Teal800 : ColorsPalette.Teal300,
									background: `${isDarkMode ? ColorsPalette.Teal900 : ColorsPalette.Teal100}6A`, // 6A = 42% opacity
								}
								: {
									// Inactive state: neutral border with theme-appropriate background
									borderColor: isDarkMode ? colors.Solid600 : colors.Solid400,
									background: isDarkMode ? colors.Solid400 : colors.Solid200,
								}
						),
					}}
					onClick={() => onCheckboxChange(key)(!checkboxStates[key])}
					onMouseEnter={(e) => {
						// Apply hover effects only on non-mobile devices and for inactive options
						if (!(isMobile || checkboxStates[key])) {
							e.currentTarget.style.background = `${isDarkMode ? ColorsPalette.Lime900 : ColorsPalette.Lime100}6A`;
							e.currentTarget.style.borderColor = isDarkMode ? ColorsPalette.Lime800 : ColorsPalette.Lime300;
						}
					}}
					onMouseLeave={(e) => {
						// Reset hover effects only on non-mobile devices and for inactive options
						if (!(isMobile || checkboxStates[key])) {
							e.currentTarget.style.background = isDarkMode ? colors.Solid400 : colors.Solid200;
							e.currentTarget.style.borderColor = isDarkMode ? colors.Solid600 : colors.Solid400;
						}
					}}
				>
					<div style={{
						display: 'flex',
						alignItems: 'flex-start',
						gap: '8px',
					}}>
						{/* Checkbox component for option selection */}
						<CheckBox
							isChecked={checkboxStates[key]}
							onChange={onCheckboxChange(key)}
							activeColor={checkboxStates[key] ? (isDarkMode ? ColorsPalette.Teal700 : ColorsPalette.Teal400) : undefined}
							checkColor={isDarkMode ? colors.Solid300 : colors.Solid100}
						/>

						{/* Text content container for label and description */}
						<div>
							{/* Option label with bold typography for visual hierarchy */}
							<div style={{
								fontSize: '14px',
								fontWeight: '600',
								color: isDarkMode ? colors.Solid900 : colors.Solid600,
								marginBottom: '2px',
							}}>
								{label}
							</div>

							{/* Option description with smaller text and reduced opacity */}
							<div style={{
								margin: 0,
								fontSize: '12px',
								color: isDarkMode ? colors.Solid900 : colors.Solid600,
								opacity: 0.9,
							}}>
								{description}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

/**
 * StatusIndicator Component
 * 
 * A compact visual indicator component that displays status information
 * with customizable colors and theme-aware styling. Shows active/inactive
 * states with appropriate visual cues for both light and dark themes.
 */
const StatusIndicator: React.FC<{
	active: boolean;
	label: string;
	color: string;
}> = ({ active, label, color }) => {
	// Retrieves the current theme and color palette from theme context
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode for conditional styling
	const isDarkMode = theme === 'dark';

	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			gap: '8px',
			padding: '8px 12px',
			borderRadius: '8px',
			background: active ? `${color}18` : `${isDarkMode ? colors.Solid500 : colors.Solid200}AF`,
			border: `1px solid ${active ? `${color}6F` : (isDarkMode ? colors.Solid700 : colors.Solid300)}`,
		}}>
			{/* Status indicator dot - visual cue for active/inactive state */}
			<div style={{
				width: '8px',
				height: '8px',
				borderRadius: '50%',
				backgroundColor: active ? `${color}DF` : (isDarkMode ? colors.Solid800 : colors.Solid500),
			}} />

			{/* Status label text with theme-aware typography */}
			<span style={{
				fontSize: '12px',
				fontWeight: 600,
				color: active ? colors.Solid900 : (isDarkMode ? colors.Solid800 : colors.Solid500),
			}}>
				{label}
			</span>
		</div>
	);
};

export default TransformPage;
