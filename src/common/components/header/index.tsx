import { FC, useEffect, useState } from 'react';
import { Color } from '../../../utils/types';
import { ColorsPalette } from '../../../utils/constants/colors';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../../utils/theme';

/**
 * Header component renders the website's navigation, including links for each section and the hamburger menu
 * for mobile view. It also adapts dynamically to screen width, hover, and focus states to improve user experience.
 */
const Header: FC<{
	// Prop to indicate the currently active navigation link (tab)
	activeTab?: 'Features' | 'Documentation' | 'Privacy Policy';

	// Prop to track the state of the hamburger menu (whether it is open or closed)
	hamburgerOpened: boolean;

	// Setter function to toggle the hamburger menu open/closed state
	setHamburgerOpened: (opened: boolean) => void;
}> = ({ activeTab, hamburgerOpened, setHamburgerOpened }) => {
	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors, theme } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the index of the hovered link, used to apply hover styles dynamically
	const [hoveredLinkIndex, setHoveredLinkIndex] = useState<number | null>(null);

	// State to track the index of the currently focused link, used for focus styles
	const [focusedLinkIndex, setFocusedLinkIndex] = useState<number | null>(null);

	// Tracks whether focus was triggered by keyboard navigation (e.g., Tab key) or mouse click
	const [focusTriggeredByKeyboard, setFocusTriggeredByKeyboard] = useState<boolean>(false);

	// State to store the current window width, used for responsive layout adjustments
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// List of navigation links; each entry corresponds to a page/section
	const links = ['Features', 'Documentation', 'Privacy Policy'];

	// Array of transform values for each bar in the hamburger icon
	// These define the rotation applied to each bar when the hamburger menu is opened or closed.
	const transforms = ['rotate(-45deg)', 'none', 'rotate(45deg)'];

	// Array of opacity values for each bar in the hamburger icon
	// These control the visibility of the bars when the hamburger menu is toggled.
	const opacities = [1, hamburgerOpened ? 0 : 1, 1];

	// Effect to update windowWidth state on window resize, ensuring the layout is responsive
	useEffect(() => {
		// Function to update windowWidth on resize
		const handleResize = () => setWindowWidth(window.innerWidth);

		// Add event listener for resize
		window.addEventListener('resize', handleResize);

		// Cleanup the event listener when component unmounts
		return () => {
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

	// Function to determine the background color of each navigation link based on various states
	const getLinkBackgroundColor = (index: number): Color => {
		// Highlight active tab background if hamburger menu is closed
		if (activeTab === links[index] && !hamburgerOpened) return isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime400;

		// Apply hover background color if link is hovered and is not the active tab
		if (index === hoveredLinkIndex && activeTab !== links[index] && !hamburgerOpened) {
			return colors.Solid200A;
		}

		// Default background color
		return 'transparent';
	};

	// Function to determine the text color of each navigation link based on various states
	const getLinkTextColor = (index: number): Color => {
		// Apply text color for the active tab when the hamburger menu is open
		if (activeTab === links[index] && hamburgerOpened) return isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime400;

		// Apply text color for the active tab when the hamburger menu is closed
		if (activeTab === links[index] && !hamburgerOpened) return colors.Solid100;

		// Default text color
		return colors.Solid900;
	};

	// Function to determine the border outline of the navigation link (for focus state)
	const getLinkOutline = (index: number): string | number => {
		// No outline if both hover and focus are active on the same link
		if (index === focusedLinkIndex && index === hoveredLinkIndex) return 'none';

		// Apply an outline when the link is focused, triggered by keyboard navigation (Tab)
		if (index === focusedLinkIndex && focusTriggeredByKeyboard) return `2px solid ${isDarkMode ? ColorsPalette.Teal600 : ColorsPalette.Teal400}`;

		// Default no outline
		return 'none';
	};

	return (
		<header style={{
			padding: '16px 24px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			borderBottom: `1px solid ${colors.Solid300A}`,
		}}>
			{/* Main title of the website */}
			<NavLink
				to='/'
				style={{
					margin: 0,
					marginLeft: windowWidth > 599 ? '12px' : '0',
					fontSize: '18px',
					fontWeight: 'bold',
					borderRadius: '6px',
					textDecoration: 'none',
					cursor: windowWidth < 600 ? 'none' : 'pointer',
					color: isDarkMode ? colors.Solid1100 : colors.Solid900,
				}}
			>QMLBridge</NavLink>

			{/* Render the desktop navigation links if the window width is greater than 599px */}
			{windowWidth > 599 && (
				<nav aria-label='Header Navigation'>
					<ul
						style={{
							margin: 0,
							padding: 0,
							listStyle: 'none',
							display: 'flex',
							flexWrap: 'wrap',
							columnGap: '4px',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{/* Render each navigation link */}
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
										display: 'inline-block',
										padding: '8px 12px',
										fontSize: '14px',
										borderRadius: '6px',
										textDecoration: 'none',
										transition: 'background-color 0.3s',
										cursor: windowWidth < 600 ? 'none' : 'pointer',
										color: getLinkTextColor(index),
										outline: getLinkOutline(index),
										backgroundColor: getLinkBackgroundColor(index),
									}}
								>
									{link}
								</NavLink>
							</li>
						))}
					</ul>
				</nav>
			)}

			{/* Render the mobile hamburger menu if the window width is less than 600px */}
			{windowWidth < 600 && (
				<>
					{/* Toggle hamburger menu when clicked */}
					<div
						role='button'
						aria-label='Toggle Navigation Menu'
						onClick={() => setHamburgerOpened(!hamburgerOpened)}
						style={{
							display: 'flex',
							height: '32.8px',
							zIndex: hamburgerOpened ? 999 : 'unset',
							cursor: windowWidth < 600 ? 'none' : 'pointer',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<div style={{
							width: '20px',
							height: '20px',
							display: 'flex',
							position: 'relative',
							flexDirection: 'column',
							justifyContent: 'space-around',
						}}>
							{/* Loop over the 3 bars and generate the elements */}
							{['top', 'middle', 'bottom'].map((bar, index) => (
								<span
									key={bar}
									role='presentation'
									style={{
										width: '100%',
										height: '3.2px',
										display: 'block',
										position: hamburgerOpened ? 'absolute' : 'unset',
										borderRadius: '1.6px',
										backgroundColor: isDarkMode ? colors.Solid1100 : colors.Solid900,
										transition: 'transform 0.3s',
										transform: hamburgerOpened ? transforms[index] : 'none',
										opacity: opacities[index],
									}}
								/>
							))}
						</div>
					</div>

					{/* Fullscreen mobile navigation menu, shown when the hamburger menu is opened */}
					{hamburgerOpened && (
						<nav
							role='menu'
							aria-label='Full Screen Navigation Menu'
							style={{
								top: 0,
								left: 0,
								width: '100vw',
								height: '100dvh',
								position: 'absolute',
								zIndex: hamburgerOpened ? 998 : 'unset',
								display: 'flex',
								alignItems: 'center',
								flexDirection: 'column',
								justifyContent: 'center',
								backgroundColor: colors.Solid100,
							}}
						>
							<ul style={{
								margin: 0,
								padding: 0,
								listStyle: 'none',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
							}}>
								{/* Render each navigation link */}
								{links.map((link, index) => (
									<li key={link} style={{ margin: 0 }}>
										<NavLink
											role='menuitem'
											to={`/${link.toLowerCase().replace(/ /g, '_')}`}
											onFocus={() => setFocusedLinkIndex(index)}
											onBlur={() => setFocusedLinkIndex(null)}
											onMouseEnter={() => setHoveredLinkIndex(index)}
											onMouseLeave={() => setHoveredLinkIndex(null)}
											tabIndex={0}
											style={{
												display: 'inline-block',
												padding: '8px 12px',
												fontSize: '14px',
												borderRadius: '6px',
												textDecoration: 'none',
												transition: 'background-color 0.3s',
												cursor: windowWidth < 600 ? 'none' : 'pointer',
												color: getLinkTextColor(index),
												outline: getLinkOutline(index),
												backgroundColor: getLinkBackgroundColor(index),
											}}
										>
											{link}
										</NavLink>

										{/* Line separator between menu items */}
										{index < links.length - 1 && (
											<div
												style={{
													width: '100%',
													height: '1px',
													margin: '12px 0',
													borderRadius: '1px',
													backgroundColor: colors.Solid200A,
												}}
											/>
										)}
									</li>
								))}
							</ul>
						</nav>
					)}
				</>
			)}
		</header>
	);
};

export default Header;
