// Title of the Privacy Policy Page
const title = 'Privacy Policy';

// Description of the Privacy Policy Page
const description =
	'We are committed to protecting your privacy and ensuring transparency regarding ' +
	'how we handle your data when you use our QtBridge-to-QML converter. This policy explains ' +
	'how we process your data during file conversions and your rights regarding this information.';

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

// Privacy policy object containing all sections and their descriptions
const privacy_policy: BoxOrSubBox[] = [
	{
		'type': 'subBox',
		'title': 'Data Storage & Processing',
		'subContent': {
			'File Storage': 'All files are stored temporarily in your browser\'s local storage. No data is sent to or stored on external servers - everything stays securely on your device.',
			'Processing Location': 'All conversion happens directly in your browser. Your files never leave your device or travel over the internet during processing.',
			'Font Integration': 'If fonts are needed, they are downloaded directly from Google Fonts. No personal information or file details are shared in this process.'
		},
	},
	{
		'type': 'subBox',
		'title': 'IndexedDB',
		'subContent': {
			'Secure Storage': 'IndexedDB keeps your files secure within your browser. All data remains on your device throughout the conversion process.',
			'Session-Based Retention': 'Data is kept only for your current session. You can clear your browser storage anytime to remove all local data.'
		},
	},
	{
		'type': 'box',
		'title': 'Security',
		'data': 'We prioritize your data security with local browser processing that eliminates internet transmission risks. This approach keeps your files completely private while also making the conversion process significantly faster and more efficient.',
	},
	{
		'type': 'box',
		'title': 'Policy Updates',
		'data': 'Our privacy policy may be updated to reflect improvements or new features. All changes are posted here, so we recommend checking this page periodically to stay informed about how we protect your data.',
	},
];

// Exporting the title, description and the privacy policy object for use in other parts of the application
export { title, description, privacy_policy };
