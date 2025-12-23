import { ColorsPalette } from "../../utils/constants/colors";

/**
 * Main title for the landing page that describes the tool's
 * primary function
 */
const title = 'Effortlessly Convert QtBridge Files to QML Code';

/**
 * Detailed description of the tool's functionality and benefits.
 * Highlights key features: fast conversion, font management, live logging,
 * and production-ready output.
 */
const description =
	'Transform your QtBridge files to organized QML code in seconds! ' +
	'With fast conversion, automatic font downloads, and live logging, ' +
	'our tool ensures your designs are accurately translated and ready to use. ' +
	'Say goodbye to tedious adjustments—get clean, production-ready QML instantly.';

/**
 * Array of key feature objects displayed in the landing page's feature highlights
 * section. Each feature includes a title, description, and theme-specific color
 * configuration.
 */
const keyFeatures = [
	{
		title: 'Instant Conversion',
		description: 'Convert QtBridge files to QML in seconds',
		color: {
			light: ColorsPalette.Lime400,
			dark: ColorsPalette.Lime700,
		}
	},
	{
		title: 'Local Processing',
		description: 'No data sent to external servers',
		color: {
			light: ColorsPalette.Teal400,
			dark: ColorsPalette.Teal700,
		}
	},
	{
		title: 'Live Progress',
		description: 'Real-time conversion tracking',
		color: {
			light: ColorsPalette.Green400,
			dark: ColorsPalette.Green700,
		}
	},
	{
		title: 'Font Management',
		description: 'Automatic font downloads & integration',
		color: {
			light: ColorsPalette.Yellow400,
			dark: ColorsPalette.Yellow700,
		}
	}
];

// Exporting the title, description, and keyFeatures for use in
// the LandingPage component
export { title, description, keyFeatures };