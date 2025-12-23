// Title for the documentation page
const title = 'Documentation';

// Description of the guide's purpose and the steps covered
const description =
	'Easily transform your QtBridge files into production-ready QML code with our converter. ' +
	'This guide covers everything from uploading your files and customizing options to ' +
	'downloading the final QML output. Get started quickly, explore unique features, and ' +
	'check out our troubleshooting tips to make the most of every conversion.';

// Array of steps in the conversion process, each with a title and description
const steps = [
	{
		title: 'Upload Your QtBridge File',
		description: 'On the main page, click "Get Started" to navigate to the upload page. Here, you can drag and drop your QtBridge file or use the file selector to upload it for conversion. Ensure your file is in .qtbridge format for successful processing.'
	},
	{
		title: 'Select Conversion Options',
		description: 'After uploading, customize your output by choosing from options like adding unique IDs, object names, and downloading fonts. These settings help tailor the QML output to match your specific project needs and design requirements.'
	},
	{
		title: 'Start the Transformation',
		description: 'When you\'re ready, click the "Transform" button to initiate the conversion. This process will transform your QtBridge file into structured and beautified QML code based on the options you selected.'
	},
	{
		title: 'Monitor the Process',
		description: 'As the transformation progresses, a live logging panel will display each stage in real-time. This lets you track the progress of the conversion and see when each step completes.'
	},
	{
		title: 'Download Your Files',
		description: 'Once the transformation is finished, the "Download Files" button will appear. Click it to download your finalized QML code and any additional resources, such as custom fonts, ready for integration into your Qt project.'
	}
];

// Exporting the title, description, and steps for use in the documentation
export { title, description, steps };
