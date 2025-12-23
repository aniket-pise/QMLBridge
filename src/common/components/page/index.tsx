import { Footer, Header } from '..';
import { useState, ReactNode, FC } from 'react';
import { useTheme } from '../../../utils/theme';

/**
 * The `Page` component is a layout wrapper that structures the overall page content. 
 * It includes a header, footer, and the main content area. The component also manages 
 * the state of the hamburger menu (open/closed) and adjusts layout styles based on the 
 * window width to create a responsive design.
 * 
 * @param {Object} props
 * @param {string} [props.activeTab] - Optional string to indicate the currently active tab in the header.
 * @param {number} props.windowWidth - The current width of the window, used to adjust layout and styling.
 * @param {ReactNode} props.children - The main content to be displayed within the page wrapper.
 */
const Page: FC<{
	// Optional prop to highlight active navigation tab
	activeTab?: 'Features' | 'Documentation' | 'Privacy Policy',

	// Current window width for responsive layout
	windowWidth: number,

	// The content that will be rendered inside the page wrapper
	children: ReactNode,
}> = ({ activeTab, windowWidth, children }) => {
	// State to manage the open/close status of the hamburger menu
	const [hamburgerOpened, setHamburgerOpened] = useState(false);

	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors } = useTheme();

	return (
		<div style={{
			// Sets the background color of the page using a solid color from the `colors` object (Solid100)
			backgroundColor: colors.Background,

			// Centers the content horizontally by setting automatic left and right margins
			margin: 'auto',

			// Ensures the width of the page is 100% of the viewport width
			width: '100vw',

			// Ensures the height of the page is 100% of the viewport height
			height: '100dvh',

			// Uses flexbox to create a flexible layout for the page content
			display: 'flex',

			// Disables text selection on the entire page, preventing accidental text highlighting
			userSelect: 'none',

			// Stacks the child components (header, content, and footer) vertically in the page layout
			flexDirection: 'column',

			// Distributes the space evenly between header, content, and footer
			justifyContent: 'space-between',

			// Hides overflow content when the hamburger menu is open, preventing page content from shifting
			overflow: hamburgerOpened ? 'hidden' : 'scroll',

			// Restricts the maximum width of the page on larger screens (only when windowWidth > 599px)
			maxWidth: windowWidth > 599 ? '1600px' : 'initial',

			// Restricts the maximum height of the page on larger screens to prevent overflow
			maxHeight: windowWidth > 599 ? '900px' : 'initial',

			// Adds a subtle shadow effect around the page for visual depth
			boxShadow: ` 10px  10px 10px ${colors.Solid100A}, 
                  -10px -10px 10px ${colors.Solid100A}`,
		}}>
			{/* Header component that includes navigation and the hamburger menu */}
			<Header
				// Pass the active tab state to highlight the correct navigation item
				activeTab={activeTab}

				// Pass the hamburger menu state (open/close)
				hamburgerOpened={hamburgerOpened}

				// Provide a function to toggle the hamburger menu state
				setHamburgerOpened={setHamburgerOpened}
			/>

			{/* The children prop represents the main content of the page that will be rendered here */}
			{children}

			{/* Footer component that always appears at the bottom of the page */}
			<Footer />
		</div>
	);
};

export default Page;
