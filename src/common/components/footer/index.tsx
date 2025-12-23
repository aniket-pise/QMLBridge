import { FC, useEffect, useState } from 'react';
import { Color } from '../../../utils/types';
import { ColorsPalette } from '../../../utils/constants/colors';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../../utils/theme';

/**
 * Footer component that displays navigation links and social media icons.
 * It includes responsive styling for different screen sizes, handles hover and focus states,
 * and dynamically adjusts layout and styling based on the window width.
 */
const Footer: FC = () => {
	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors, theme } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the index of the hovered navigation link for hover styles
	const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);

	// State to track the index of the hovered social media icon for hover styles
	const [hoveredIconIndex, setHoveredIconIndex] = useState<number | null>(null);

	// State to track the index of the focused link (for focus outline)
	const [focusedLinkIndex, setFocusedLinkIndex] = useState<number | null>(null);

	// State to track the index of the focused social media icon (for focus outline)
	const [focusedIconIndex, setFocusedIconIndex] = useState<number | null>(null);

	// Tracks whether focus was triggered by keyboard navigation (Tab key) or mouse click
	const [focusTriggeredByKeyboard, setFocusTriggeredByKeyboard] = useState<boolean>(false);

	// State to track the current window width to adjust the layout responsively
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// Get the current year for copyright display (used in the footer)
	const currentYear = new Date().getFullYear();

	// Array of footer navigation links to be displayed in the footer
	const links = ['About', 'FAQ', 'Privacy Policy', 'Terms of Service'];

	// Array of social media links and their corresponding SVG icon paths
	const socialLinks = [
		{ url: 'https://github.com/aniket-pise/QMLBridge', iconPath: 'M448 96c0-35.3-28.7-64-64-64H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96zM265.8 407.7c0-1.8 0-6 .1-11.6c.1-11.4 .1-28.8 .1-43.7c0-15.6-5.2-25.5-11.3-30.7c37-4.1 76-9.2 76-73.1c0-18.2-6.5-27.3-17.1-39c1.7-4.3 7.4-22-1.7-45c-13.9-4.3-45.7 17.9-45.7 17.9c-13.2-3.7-27.5-5.6-41.6-5.6s-28.4 1.9-41.6 5.6c0 0-31.8-22.2-45.7-17.9c-9.1 22.9-3.5 40.6-1.7 45c-10.6 11.7-15.6 20.8-15.6 39c0 63.6 37.3 69 74.3 73.1c-4.8 4.3-9.1 11.7-10.6 22.3c-9.5 4.3-33.8 11.7-48.3-13.9c-9.1-15.8-25.5-17.1-25.5-17.1c-16.2-.2-1.1 10.2-1.1 10.2c10.8 5 18.4 24.2 18.4 24.2c9.7 29.7 56.1 19.7 56.1 19.7c0 9 .1 21.7 .1 30.6c0 4.8 .1 8.6 .1 10c0 4.3-3 9.5-11.5 8C106 393.6 59.8 330.8 59.8 257.4c0-91.8 70.2-161.5 162-161.5s166.2 69.7 166.2 161.5c.1 73.4-44.7 136.3-110.7 158.3c-8.4 1.5-11.5-3.7-11.5-8zm-90.5-54.8c-.2-1.5 1.1-2.8 3-3.2c1.9-.2 3.7 .6 3.9 1.9c.3 1.3-1 2.6-3 3c-1.9 .4-3.7-.4-3.9-1.7zm-9.1 3.2c-2.2 .2-3.7-.9-3.7-2.4c0-1.3 1.5-2.4 3.5-2.4c1.9-.2 3.7 .9 3.7 2.4c0 1.3-1.5 2.4-3.5 2.4zm-14.3-2.2c-1.9-.4-3.2-1.9-2.8-3.2s2.4-1.9 4.1-1.5c2 .6 3.3 2.1 2.8 3.4c-.4 1.3-2.4 1.9-4.1 1.3zm-12.5-7.3c-1.5-1.3-1.9-3.2-.9-4.1c.9-1.1 2.8-.9 4.3 .6c1.3 1.3 1.8 3.3 .9 4.1c-.9 1.1-2.8 .9-4.3-.6zm-8.5-10c-1.1-1.5-1.1-3.2 0-3.9c1.1-.9 2.8-.2 3.7 1.3c1.1 1.5 1.1 3.3 0 4.1c-.9 .6-2.6 0-3.7-1.5zm-6.3-8.8c-1.1-1.3-1.3-2.8-.4-3.5c.9-.9 2.4-.4 3.5 .6c1.1 1.3 1.3 2.8 .4 3.5c-.9 .9-2.4 .4-3.5-.6zm-6-6.4c-1.3-.6-1.9-1.7-1.5-2.6c.4-.6 1.5-.9 2.8-.4c1.3 .7 1.9 1.8 1.5 2.6c-.4 .9-1.7 1.1-2.8 .4z' },
		{ url: 'https://www.linkedin.com', iconPath: 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z' },
		{ url: 'https://x.com', iconPath: 'M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6 379.4 396H283.8L209 298.1 123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5L313.6 116h47.5zM323.3 367.6L153.4 142.9H125.1L296.9 367.6h26.3z' }
	];

	// Effect hook to handle window resizing for responsiveness
	useEffect(() => {
		// Function to handle window resize and update the state
		const handleResize = () => setWindowWidth(window.innerWidth);

		// Add event listener on mount to track window size changes
		window.addEventListener('resize', handleResize);

		return () => {
			// Cleanup event listener on component unmount
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	// Effect to detect keyboard (Tab key) vs mouse navigation and apply corresponding focus styles
	useEffect(() => {
		// Event handler to detect if user is navigating via keyboard (Tab key)
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Tab') {
				// Set to true if keyboard navigation is detected
				setFocusTriggeredByKeyboard(true);
			}
		};

		// Event handler to detect mouse interaction
		const handleMouseDown = () => {
			// Set to false if mouse interaction is detected
			setFocusTriggeredByKeyboard(false);
		};

		// Add event listeners for keydown and mousedown
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('mousedown', handleMouseDown);

		// Cleanup the event listeners when component unmounts
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('mousedown', handleMouseDown);
		};
	}, []);

	// Helper function to determine background color of navigation link on hover
	const getButtonBackgroundColor = (index: number): Color => {
		// Return color when hovered
		if (index === hoveredLinkIndex) return colors.Solid200A;

		// Return transparent background when not hovered
		return 'transparent';
	};

	// Helper function to determine icon background color on hover
	const getIconButtonColor = (index: number): Color => {
		// Return color when hovered
		if (index === hoveredIconIndex) return colors.Solid200A;

		// Return transparent background when not hovered
		return 'transparent';
	};

	// Helper function to determine outline of navigation link based on focus
	const getLinkOutline = (index: number): string | number => {
		// No outline if both hover and focus are active
		if (index === focusedLinkIndex && index === hoveredLinkIndex) return 'none';

		// Apply teal color outline when the link is focused (triggered by keyboard navigation)
		if (index === focusedLinkIndex && focusTriggeredByKeyboard) return `2px solid ${isDarkMode ? ColorsPalette.Teal600 : ColorsPalette.Teal400}`;

		// Default case: no outline
		return 'none';
	};

	// Helper function to determine outline of social media icon based on focus
	const getIconOutline = (index: number): string | number => {
		// No outline if both hover and focus are active on the icon
		if (index === focusedIconIndex && index === hoveredIconIndex) return 'none';

		// Apply teal color outline when the icon is focused (triggered by keyboard navigation)
		if (index === focusedIconIndex && focusTriggeredByKeyboard) return `2px solid ${isDarkMode ? ColorsPalette.Teal600 : ColorsPalette.Teal400}`;

		// Default case: no outline
		return 'none';
	};

	return (
		<footer style={{
			rowGap: '16px',
			padding: '16px 24px',
			borderTop: `1px solid ${colors.Solid300A}`,
			display: 'flex',
			alignItems: 'center',
			flexDirection: windowWidth < 580 ? 'column' : 'row',
			justifyContent: 'space-between',
		}}>
			{/* Navigation Links Container */}
			<nav aria-label='Footer Navigation'>
				<ul style={{
					margin: 0,
					padding: 0,
					rowGap: '4px',
					columnGap: '4px',
					listStyle: 'none',
					display: 'flex',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'center',
				}}>
					{links.map((link, index) => (
						<li key={link} style={{ margin: 0 }}>
							<NavLink
								to={`/${link.toLowerCase().replace(/ /g, '_')}`}
								onFocus={() => setFocusedLinkIndex(index)}
								onBlur={() => setFocusedLinkIndex(null)}
								onMouseEnter={() => setHoveredLinkIndex(index)}
								onMouseLeave={() => setHoveredLinkIndex(null)}
								tabIndex={0}
								style={{
									color: colors.Solid900,
									display: 'inline-block',
									width: 'max-content',
									padding: '8px 12px',
									fontSize: '14px',
									borderRadius: '6px',
									textDecoration: 'none',
									transition: 'background-color 0.3s',
									cursor: windowWidth < 600 ? 'none' : 'pointer',
									outline: getLinkOutline(index),
									backgroundColor: getButtonBackgroundColor(index),
								}}
							>
								{link}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{/* Copyright and Social Media Icons Container */}
			<section style={{
				rowGap: '4px',
				columnGap: '4px',
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: windowWidth < 980 ? 'column' : 'row',
			}}>
				{/* Copyright Information */}
				<p style={{
					color: colors.Solid900,
					margin: 0,
					fontSize: '14px',
					textAlign: 'center',
					padding: '8px 12px',
				}}>© {currentYear} QMLBridge - Independent Open-Source Project</p>

				{/* Social Media Icons */}
				<nav aria-label='Social Media Links'>
					<ul style={{
						margin: 0,
						padding: 0,
						display: 'flex',
						columnGap: '4px',
						listStyle: 'none',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
						{socialLinks.map(({ url, iconPath }, index) => (
							<li key={index} style={{ margin: 0 }}>
								<a
									rel='noopener noreferrer'
									target='_blank'
									href={url}
									tabIndex={0}
									onFocus={() => setFocusedIconIndex(index)}
									onBlur={() => setFocusedIconIndex(null)}
									onMouseEnter={() => setHoveredIconIndex(index)}
									onMouseLeave={() => setHoveredIconIndex(null)}
									style={{
										fill: colors.Solid900,
										width: '16.8px',
										height: '16.8px',
										display: 'inline-block',
										padding: '8px 12px',
										borderRadius: '6px',
										cursor: windowWidth < 600 ? 'none' : 'pointer',
										transition: 'background-color 0.3s',
										outline: getIconOutline(index),
										backgroundColor: getIconButtonColor(index),
									}}
								>
									<svg viewBox='0 0 448 512' aria-hidden='true'>
										<path d={iconPath} />
									</svg>
								</a>
							</li>
						))}
					</ul>
				</nav>
			</section>
		</footer>
	);
};

export default Footer;
