// Title of the Terms of Service Page
const title = 'Terms of Service';

// Brief description of the service and its purpose
const description =
	'Welcome to our QtBridge to QML Converter! We provide a reliable, ' +
	'secure, and fast service for converting QtBridge files to QML code. ' +
	'Please review our Terms of Service, which outline your rights and responsibilities ' +
	'when using our tool. By accessing or using this website, you agree ' +
	'to comply with these terms.';

// A type that can represent either a 'subBox' or a 'box'.
// - A 'box' includes a title and a single piece of data.
// - A 'subBox' includes a title and a set of key-value pairs in subContent.
type BoxOrSubBox = ({
	type: 'subBox';
	title: string;
	subContent: Record<string, string>;
} | {
	type: 'box';
	title: string;
	data: string;
});

// Terms of Service object containing sections and their respective descriptions
const terms_of_service: BoxOrSubBox[] = [
	{
		'type': 'box',
		'title': 'Acceptance of Terms',
		'data': 'Your use of this website means you accept and agree to follow these Terms of Service. Continued access and usage indicate your ongoing agreement with these terms. If you disagree with any part of these terms, please discontinue use of our service immediately.',
	},
	{
		'type': 'box',
		'title': 'Description of Services',
		'data': 'This website converts QtBridge files into QML code. You can upload files, select options, and download generated QML code. All processing occurs within your browser - no files are stored or shared externally.',
	},
	{
		'type': 'subBox',
		'title': 'User Responsibilities',
		'subContent': {
			'File Content': 'You are responsible for the content of files you upload. We are not liable for copyright infringement or other legal issues related to submitted files.',
			'Compliance': 'Use this service only for lawful purposes and in compliance with all applicable laws and regulations.',
		},
	},
	{
		'type': 'subBox',
		'title': 'Intellectual Property',
		'subContent': {
			'Service Ownership': 'All content, design, and functionality of this website are our property. You may not reproduce or distribute any part without permission.',
			'Generated Files': 'Generated QML code is based on your uploaded files and is for your use. We retain no ownership over the produced QML code.',
		},
	},
	{
		'type': 'subBox',
		'title': 'Limitation of Liability',
		'subContent': {
			'No Warranties': 'This service is provided "as is" without warranties. We do not guarantee the accuracy or completeness of generated QML code.',
			'Limitation': 'We are not liable for any indirect, incidental, or consequential damages from your use of this service.',
		},
	},
	{
		'type': 'box',
		'title': 'Privacy Policy',
		'data': 'Using this website means you also accept our Privacy Policy. This explains how we handle your data, including IndexedDB usage and Google Fonts integration for conversions. Your privacy is important, and we detail all data handling practices in this policy.',
	},
	{
		'type': 'box',
		'title': 'Changes to Terms',
		'data': 'We may update these Terms when our services change or to improve clarity. Updates will be posted here, so please check back periodically for the latest version that applies to your use of our converter.',
	},
	{
		'type': 'box',
		'title': 'Disclaimer',
		'data': 'This website and converter are not affiliated with or endorsed by The Qt Company. "Qt" and "QtBridge" are their trademarks. Our tool is independently developed to help users convert QtBridge files to QML.',
	},
];

// Exporting the title, description, and terms of service object for use in other parts of the application
export { title, description, terms_of_service };
