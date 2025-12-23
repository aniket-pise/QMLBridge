// Title for the FAQ section
const title = 'FAQs';

// Description that gives an overview of what the FAQ section is about
const description =
	'Welcome to the QMLBridge FAQ! Here, we\'ve gathered answers to common ' +
	'questions to help you get the most out of our tool. If you don\'t see ' +
	'your question listed, feel free to reach out to us directly.';

// Array of FAQ items
const faqs = [
	{
		title: 'What is QMLBridge?',
		data: 'QMLBridge is a web-based tool that converts QtBridge design files into QML code. It simplifies the transition from design to development, providing fast and structured QML code directly in your browser.',
	},
	{
		title: 'Do I need to install any software to use QMLBridge?',
		data: 'No, QMLBridge works entirely in your browser. There\'s no need for additional software, making it a quick and convenient solution.',
	},
	{
		title: 'Is my data secure when I use QMLBridge?',
		data: 'Yes, QMLBridge performs all file processing locally within your browser. Files aren\'t uploaded to any server, so your data stays private.',
	},
	{
		title: 'How long does the conversion process take?',
		data: 'The conversion is almost instant, taking only seconds to generate your QML code, depending on the file size and selected options.',
	},
	{
		title: 'Can I customize the QML output?',
		data: 'Yes, QMLBridge offers customization options, such as adding IDs, object names, unique identifiers, and choosing to include specific fonts from Google Fonts.',
	},
	{
		title: 'Is QMLBridge affiliated with The Qt Company?',
		data: 'No, QMLBridge is an independent tool and is not affiliated with or endorsed by The Qt Company. We created QMLBridge to assist developers working with QtBridge files by generating QML code.',
	},
	{
		title: 'What if I encounter issues with the QML code output?',
		data: 'We aim to provide accurate and clean QML code. If you encounter any issues, please reach out to us via your support email or contact form link for assistance.',
	},
	{
		title: 'Can I use QMLBridge for free?',
		data: 'Yes, QMLBridge is completely free to use for all developers to streamline their design-to-code workflow.',
	},
	{
		title: 'How do you handle fonts in QMLBridge?',
		data: 'QMLBridge can include fonts in your QML output by fetching them directly from the Google Fonts API. This ensures any fonts in your design are accurately represented.',
	},
	{
		title: 'Are there any file size limitations?',
		data: 'For best performance, we recommend uploading QtBridge files that are under 10 MB. Larger files may take longer to process and could affect your browser\'s performance.',
	},
];

// Exporting the title, description, and faqs so they can be used in other parts of the application
export { title, description, faqs };
