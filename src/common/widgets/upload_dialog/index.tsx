import IconButton from '../button/icon';
import FileProcessor from '../../../data/services/FileProcessor';
import getFormattedSize from '../../../utils/helpers/get-formatted-size';

import { Color } from '../../../utils/types';
import { ColorsPalette } from '../../../utils/constants/colors';
import { FC, MouseEvent, useState } from 'react';
import { useTheme } from '../../../utils/theme';

/**
 * UploadDialog Component
 * 
 * This component provides an interface for file upload with drag-and-drop and click-to-select
 * functionality. It validates files by type (.qtbridge) and size (10 MB limit) and displays
 * the file details upon upload.
 * 
 * @component
 * @param {Function} setIsFileUploaded - A callback function that updates the parent
 * 																			 component's state to indicate whether a file has
 * 																			 been successfully uploaded.
 */
const UploadDialog: FC<{
	updateLogs: (message: string, refresh?: boolean) => void,
	setIsFileUploaded: (value: boolean) => void,
}> = ({ updateLogs, setIsFileUploaded }) => {
	// Retrieves the theme colors and current theme using the `useTheme` hook
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track if uploadArea is hovered.
	const [isHover, setIsHover] = useState(false);

	// State to track whether the user is dragging a file over the upload area.
	const [isDragging, setIsDragging] = useState(false);

	// State to hold the name of the uploaded file, initialized as null.
	const [fileName, setFileName] = useState<string | null>(null);

	// State to hold the size of the uploaded file, initialized as null.
	const [fileSize, setFileSize] = useState<string | null>(null);

	// State to track if there is a file size error (true if error exists, false otherwise).
	const [isFileSizeError, setIsFileSizeError] = useState(false);

	// State to track if there is a file type error (true if error exists, false otherwise).
	const [isFileTypeError, setIsFileTypeError] = useState(false);

	/**
	 * Handles the drag over event.
	 * 
	 * Prevents the default behavior and sets the dragging state to true,
	 * indicating that a file is being dragged over the upload area.
	 * 
	 * @param {MouseEvent<HTMLDivElement>} event - The drag over event.
	 */
	const handleDragOver = (event: MouseEvent<HTMLDivElement>) => {
		// Prevent the default drag behavior
		event.preventDefault();

		// Set the dragging state to true
		setIsDragging(true);
	};

	/**
	 * Handles the drag leave event.
	 * 
	 * Resets the dragging state to false when a dragged file leaves the upload area.
	 */
	const handleDragLeave = () => {
		// Set the dragging state to false
		setIsDragging(false);
	};

	/**
	 * Handles the file upload process.
	 * 
	 * This function validates the file by checking its type and size, and then uploads
	 * it to storage. If any error occurs during the process, it updates the state
	 * accordingly.
	 * 
	 * @param {File} file - The file to be uploaded. It should be a `.qtbridge`
	 * 											file with a maximum size of 10MB.
	 */
	const handleFileUpload = async (file: File) => {
		// Delete the previously uploaded file, if any, before proceeding with the new upload
		if (fileName) await handleDelete();

		try {
			// Reset the file size error state to handle any potential size validation
			setIsFileSizeError(false);

			// Reset the file type error state to handle any potential type validation
			setIsFileTypeError(false);

			// Reset the file uploaded state to false, indicating no file has been uploaded yet
			setIsFileUploaded(false);

			// Validate the file type by checking its extension (only '.qtbridge' is allowed)
			if (file.name.endsWith('.qtbridge')) {
				// Set the maximum allowed file size (in megabytes)
				const maxSizeMB = 10;

				// Convert the maximum size to bytes for comparison
				const maxSizeBytes = maxSizeMB * 1024 * 1024;

				// Check if the uploaded file exceeds the maximum allowed size
				if (file.size > maxSizeBytes) {
					// If the file is too large, set the file size error state to true
					setIsFileSizeError(true);

					// Reset the error state after 10 seconds
					setTimeout(() => { setIsFileSizeError(false); }, 10000);

					// Exit the function early if the file size is too large
					return;
				}

				// Create an instance of FileProcessor to handle database operations related to the file
				const fileProcessor = new FileProcessor();

				// Initialize the database connection (required before uploading)
				await fileProcessor.initDB();

				// Extract the file name without the extension for storage or display
				setFileName(file.name.replace(/\.[^/.]+$/, ''));

				// Format and set the file size to be displayed in a user-friendly format
				setFileSize(getFormattedSize(file.size));

				// Proceed with uploading the file to the storage system
				await fileProcessor.uploadFileToStorage(file);

				// Indicate that the file has been successfully uploaded
				setIsFileUploaded(true);

				// Log the successful upload of the file, providing the file name
				updateLogs(`File "${file.name}" uploaded successfully`);

				// Close the database connection once the file is uploaded and processing is complete
				fileProcessor.closeConnections();
			} else {
				// If the file type is not valid, set the file type error state to true
				setIsFileTypeError(true);

				// Reset the error state after 10 seconds
				setTimeout(() => { setIsFileTypeError(false); }, 10000);
			}
		} catch (error) {
			// Log any errors that occur during the file upload process for debugging purposes
			console.log(error);

			// Update the logs state to inform the user about the failure
			updateLogs(`Error during file upload: ${error}`);
		}
	};

	/**
	 * Handles the drop event.
	 * 
	 * Prevents the default behavior, resets the dragging state, 
	 * and uploads the dropped file if one is present.
	 * 
	 * @param {React.DragEvent<HTMLDivElement>} event - The drop event.
	 */
	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		// Prevent the default drop behavior
		event.preventDefault();

		// Set the dragging state to false
		setIsDragging(false);

		// Get the first file from the dropped files
		const file = event.dataTransfer.files[0];

		// If a file exists, initiate the upload process
		if (file) handleFileUpload(file);
	};

	/**
	 * Handles file selection via a file input dialog.
	 * 
	 * Creates a file input element, sets its properties,
	 * and triggers a click to open the file dialog. 
	 * Once a file is selected, it calls the handleFileUpload function.
	 */
	const handleFileSelect = () => {
		// Create a new input element
		const input = document.createElement('input');

		// Set the input type to 'file'
		input.type = 'file';

		// Only accept files with the '.qtbridge' extension
		input.accept = '.qtbridge';

		// Set up an onchange event handler
		input.onchange = (event: any) => {
			// Get the first selected file
			const file = event.target.files[0];

			// If a file exists, initiate the upload process
			if (file) handleFileUpload(file);
		};

		// Trigger a click event to open the file dialog
		input.click();
	};

	/**
	 * Handles the deletion of the uploaded file.
	 * 
	 * Checks if a file name exists. If so, it deletes the file from the database,
	 * closes the database connections, and resets the file name and size states to null.
	 * Finally, it updates the log to indicate that the file was successfully deleted.
	 */
	const handleDelete = async () => {
		try {
			// Verify if a file name exists before proceeding with deletion
			if (fileName) {
				// Create a new instance of FileProcessor to handle database operations
				const fileProcessor = new FileProcessor();

				// Initialize the database connection before performing operations
				await fileProcessor.initDB();

				// Close the database connections to free up resources and prevent memory leaks
				fileProcessor.closeConnections();

				// Delete the file from the database using the FileProcessor delete method
				await fileProcessor.deleteDB();

				// Reset the file name state to null, indicating no file is currently uploaded
				setFileName(null);

				// Reset the file size state to null, clearing the previously stored file size
				setFileSize(null);

				// Update the state to indicate that no file is currently uploaded
				setIsFileUploaded(false);

				// Log the successful deletion of the file with the file name for user feedback
				updateLogs(`File "${fileName}.qtbridge" deleted successfully`, true);
			}
		} catch (error) {
			// Log any errors that occur during the deletion process to the console for debugging
			console.log(error);

			// Update logs state to inform the user about the deletion failure
			updateLogs(`${error}`);
		}
	};

	// Function to handle mouse enter event
	// Sets the hover state to true when the mouse enters the element
	const handleMouseEnter = () => setIsHover(true);

	// Function to handle mouse leave event
	// Sets the hover state to false when the mouse leaves the element
	const handleMouseLeave = () => setIsHover(false);

	/**
	 * Determines the background color based on the hover state.
	 * 
	 * @returns {Color} The background color to apply:
	 * - Returns a lighter color when the element is hovered over.
	 * - Returns the default color when not hovered.
	 */
	const getUploadAreaBackgroundColor = () => {
		// Return lighter background color if hovered
		if (isHover) return `${isDarkMode ? colors.Solid500 : colors.Solid300}9F`;

		// Return lighter background color if dragging
		if (isDragging) return `${isDarkMode ? ColorsPalette.Lime900 : ColorsPalette.Lime100}6A`;

		// Return default background color if not hovered
		return isDarkMode ? colors.Solid400 : colors.Solid200;
	}

	/**
	 * Determines the border color based on the dragging state.
	 * 
	 * @returns {Color} The border color to apply:
	 * - Returns a teal color when the element is being dragged over.
	 * - Returns the default border color when not being dragged.
	 */
	const getUploadAreaBorderColor = (): Color => {
		// Return teal border color if dragging
		if (isDragging) return isDarkMode ? ColorsPalette.Lime800 : ColorsPalette.Lime300;

		// Return default border color if not dragging
		return isDarkMode ? colors.Solid500A : colors.Solid300A;
	}

	/**
	 * Creates a ripple effect on the target element when clicked.
	 * 
	 * The ripple effect expands from the point of the click and fades out.
	 * 
	 * @param {MouseEvent<HTMLDivElement>} event - The mouse event from the click.
	 */
	const createRipple = (event: MouseEvent<HTMLDivElement>) => {
		// Get the element that was clicked
		const target = event.currentTarget;

		// Create a span element for the ripple
		const circle = document.createElement('span');

		// Calculate the diameter based on the target's size
		const diameter = Math.max(target.clientWidth, target.clientHeight);

		// Calculate the radius for positioning the ripple
		const radius = diameter / 2;

		// Set the width and height of the circle to the calculated diameter
		circle.style.width = circle.style.height = `${diameter}px`;

		// Position the circle based on the click coordinates
		circle.style.top = `${event.clientY - target.offsetTop - radius}px`;
		circle.style.left = `${event.clientX - target.offsetLeft - radius}px`;

		// Add the 'ripple' class for styling
		circle.className = 'ripple';

		// Check if a ripple already exists
		const ripple = target.getElementsByClassName('ripple')[0];
		if (ripple) {
			// Remove the existing ripple if it exists
			ripple.remove();
		}

		// Append the new ripple circle to the target
		target.appendChild(circle);

		// Remove the ripple after 600 milliseconds
		setTimeout(() => circle.remove(), 600);
	};

	return (
		<>
			<div style={{
				userSelect: 'none',
				borderRadius: '16px',
				border: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
				boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
				background: isDarkMode ? colors.Solid300 : colors.Solid100,
			}}>
				{/* Section introducing the file upload area with an icon and heading. */}
				<div style={{
					padding: '18px 20px',
					borderRadius: '16px 16px 0 0',
					borderBottom: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
					background: `linear-gradient(90deg, ${isDarkMode ? colors.Solid300 : colors.Solid100} 0%, ${colors.Solid200} 100%)`,
				}}>
					{/* Title section that introduces the file upload feature */}
					<h3 style={{
						gap: '14px',
						margin: 0,
						fontWeight: 600,
						display: 'flex',
						alignItems: 'center',
					}}>
						{/* Upload icon indicating the action of uploading a file */}
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill={isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime400}>
							<path d="M2.25002 16.75C2.25002 16.1977 2.69774 15.75 3.25002 15.75C3.80231 15.75 4.25002 16.1977 4.25002 16.75C4.25002 17.7443 4.25882 18.0453 4.31838 18.2676C4.50332 18.9578 5.04226 19.4967 5.73244 19.6816C5.95472 19.7412 6.25567 19.75 7.25002 19.75H16.75L17.375 19.748C17.8899 19.7428 18.1009 19.7263 18.2676 19.6816C18.9578 19.4967 19.4967 18.9578 19.6817 18.2676C19.7412 18.0453 19.75 17.7443 19.75 16.75C19.75 16.1977 20.1977 15.75 20.75 15.75C21.3023 15.75 21.75 16.1977 21.75 16.75C21.75 17.6156 21.7582 18.2444 21.6133 18.7852C21.2434 20.1655 20.1655 21.2434 18.7852 21.6133C18.2445 21.7582 17.6156 21.75 16.75 21.75H7.25002C6.38444 21.75 5.75559 21.7582 5.21487 21.6133C3.8345 21.2434 2.75661 20.1655 2.38674 18.7852C2.24186 18.2444 2.25002 17.6156 2.25002 16.75Z" />
							<path d="M12 16.75C11.4477 16.75 11 16.3023 11 15.75V5.14066C10.6959 5.44576 10.3742 5.79408 10.0605 6.15531C9.5874 6.70024 9.14786 7.24867 8.82518 7.66215C8.66425 7.86837 8.39588 8.22335 8.30565 8.34281C7.97823 8.78739 7.35189 8.88288 6.90721 8.5557C6.46264 8.22829 6.36714 7.60194 6.69432 7.15726C6.78996 7.03063 7.07974 6.64733 7.24803 6.43168C7.58372 6.00152 8.04638 5.42459 8.54979 4.84476C9.04902 4.26976 9.60862 3.66902 10.1348 3.20414C10.3967 2.97271 10.6741 2.75342 10.9502 2.58695C11.1989 2.43706 11.5734 2.25003 12 2.25004C12.4266 2.25005 12.8011 2.43706 13.0498 2.58695C13.3259 2.75342 13.6033 2.97271 13.8652 3.20414C14.3913 3.66901 14.9509 4.26978 15.4502 4.84476C15.9536 5.42459 16.4162 6.00154 16.7519 6.43168C16.9202 6.64733 17.21 7.03064 17.3056 7.15726C17.6328 7.60191 17.5373 8.2273 17.0928 8.55473C16.6481 8.88224 16.0218 8.78751 15.6943 8.34281C15.6041 8.22335 15.3357 7.86837 15.1748 7.66215C14.8521 7.24868 14.4126 6.70024 13.9394 6.15531C13.6258 5.79408 13.3041 5.44576 13 5.14066V15.75C13 16.3023 12.5523 16.75 12 16.75Z" />
						</svg>

						{/* Heading text displaying the section title: "File Upload" */}
						<p style={{
							margin: 0,
							fontSize: '14px',
							color: isDarkMode ? colors.Solid900 : colors.Solid600,
							fontWeight: '600',
						}}>File Upload</p>
					</h3>
				</div>

				{/* Upload area that handles drag-and-drop and click-to-select file actions */}
				<div
					onClick={handleFileSelect}
					onDrop={handleDrop}
					onMouseDown={createRipple}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					style={{
						cursor: 'pointer',
						display: 'flex',
						margin: 18,
						padding: 36,
						borderRadius: 10,
						overflow: 'hidden',
						position: 'relative',
						alignItems: 'center',
						flexDirection: 'column',
						border: `2px dotted ${getUploadAreaBorderColor()}`,
						backgroundColor: getUploadAreaBackgroundColor(),
					}}
				>
					{/* SVG icon representing file upload */}
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='36'
						height='36'
						viewBox='0 0 24 24'
						fill='none'
						stroke={colors.Solid800}
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<polyline points='16 16 12 12 8 16' />
						<line x1='12' y1='12' x2='12' y2='21' />
						<path d='M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3' />
					</svg>

					{/* Instruction label for the user */}
					<span style={{
						color: colors.Solid800,
						fontSize: '14px',
						margin: '12px 0',
						textAlign: 'center',
					}}>Drag and drop a <b>.qtbridge</b> file, or click to select one</span>

					{/* Max file size information */}
					<div style={{
						display: 'flex',
						alignItems: 'center',
					}}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='16'
							height='16'
							viewBox='0 0 24 24'
							fill='none'
							stroke={colors.Solid800}
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<circle cx='12' cy='12' r='10' />
							<line x1='12' y1='16' x2='12' y2='12' />
							<line x1='12' y1='8' x2='12.01' y2='8' />
						</svg>
						<span style={{
							color: colors.Solid800,
							fontSize: '14px',
							marginLeft: 6,
							fontWeight: 'bold',
							textAlign: 'center',
						}}>Max file size: 10 MB</span>
					</div>
				</div>

				{/* Error message display */}
				{(isFileSizeError || isFileTypeError) && (
					<div style={{
						margin: 18,
						padding: 12,
						fontSize: 14,
						marginTop: 0,
						borderRadius: 8,
						color: isDarkMode ? ColorsPalette.Red200 : ColorsPalette.Red600,
						backgroundColor: isDarkMode ? ColorsPalette.Red900 : ColorsPalette.Red200,
					}}>
						{isFileSizeError && (
							<div style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}>
								<span>File size exceeds the <b>10 MB</b> limit. Please upload a smaller file.</span>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke={isDarkMode ? ColorsPalette.Red200 : ColorsPalette.Red600}
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									style={{ cursor: 'pointer' }}
									onClick={() => setIsFileSizeError(false)}
								>
									<line x1='18' y1='6' x2='6' y2='18' />
									<line x1='6' y1='6' x2='18' y2='18' />
								</svg>
							</div>
						)}
						{isFileTypeError && (
							<div style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}>
								<span>Only <b>.qtbridge</b> files are accepted.</span>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='18'
									height='18'
									viewBox='0 0 24 24'
									fill='none'
									stroke={isDarkMode ? ColorsPalette.Red200 : ColorsPalette.Red600}
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									style={{ cursor: 'pointer' }}
									onClick={() => setIsFileTypeError(false)}
								>
									<line x1='18' y1='6' x2='6' y2='18' />
									<line x1='6' y1='6' x2='18' y2='18' />
								</svg>
							</div>
						)}
					</div>
				)}

				{/* Display file information if a file has been uploaded */}
				{fileName && (
					<div style={{
						borderTop: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
						padding: '18px',
					}}>
						<div style={{
							background: isDarkMode ? colors.Solid400 : colors.Solid200,
							border: `1px solid ${isDarkMode ? colors.Solid600 : colors.Solid400}`,
							padding: 12,
							marginTop: 0,
							borderRadius: 8,
							display: 'flex',
							alignItems: 'center',
							flexDirection: 'row',
						}}>
							<div style={{
								padding: 8,
								marginRight: 8,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
								{/* SVG icon indicating a file is uploaded */}
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke={isDarkMode ? ColorsPalette.Red800 : ColorsPalette.Red600}
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
								>
									<path d='M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48' />
								</svg>
							</div>
							<div style={{
								flexGrow: 1,
								display: 'flex',
								overflow: 'hidden',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}>
								{/* Displaying the uploaded file name and details */}
								<div style={{
									marginRight: 12,
									overflow: 'hidden',
									whiteSpace: 'nowrap',
									textOverflow: 'ellipsis',
								}}>
									<span style={{
										color: isDarkMode ? colors.Solid900 : colors.Solid600,
										fontSize: 14,
										fontWeight: 'bold',
									}}>{fileName}</span>
									<br />
									<span style={{
										color: isDarkMode ? colors.Solid900 : colors.Solid600,
										fontSize: 12,
									}}>.qtbridge | {fileSize}</span>
								</div>

								{/* Delete button for removing the uploaded file */}
								<div>
									<IconButton
										buttonStyle={{
											padding: 0,
											borderRadius: '50%',
											primaryColor: 'transparent',
											activeColor: colors.Solid100A,
											hoverColor: colors.Solid200A,
											overlayColor: colors.Solid200A,
											fixedSize: { width: 38, height: 38 },
											borderSide: {
												width: '1.6px',
												style: 'solid',
												color: isDarkMode ? colors.Solid700 : `${colors.Solid500}AA`,
											}
										}}
										onPressed={handleDelete}
										child={
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='none'
												stroke={isDarkMode ? colors.Solid900 : colors.Solid600}
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
											>
												<polyline points='3 6 5 6 21 6' />
												<path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
												<line x1='10' y1='11' x2='10' y2='17' />
												<line x1='14' y1='11' x2='14' y2='17' />
											</svg>
										}
									/>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* CSS for Ripple Effect */}
			<style>
				{`
          /* 
           * Defines the ripple animation effect. 
           * The animation scales the element from its original size to 4 times its size 
           * and gradually fades it out to complete transparency.
           */
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }

          /* 
           * Styles for the ripple effect element. 
           * The element is positioned absolutely to overlay its parent element 
           * and has a circular shape that expands outward.
           */
          .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            background-color: ${isDarkMode ? colors.Solid600 : colors.Solid400}4A;
            animation: ripple 0.6s linear;
            pointer-events: none;
          }
        `}
			</style>
		</>
	);
};

export default UploadDialog;
