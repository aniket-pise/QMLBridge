import { useEffect, useState } from 'react';
import { Page } from '../../common/components';
import { useTheme } from '../../utils/theme';
import { title, description, features } from './data';
import { ColorsPalette } from '../../utils/constants/colors';

/**
 * FeaturesPage component displays the features of the service or product.
 * It includes a responsive layout with a dynamic design that adapts based on window size.
 * 
 * The page consists of:
 * - A title section displaying the main title and description.
 * - A grid of feature cards, each with an icon, title, and description.
 * - Responsive padding and layout adjustments based on the window width.
 * 
 * Uses React hooks to handle window resizing and dynamically adjusts content layout.
 */
const FeaturesPage: React.FC = () => {
	// Retrieves the theme colors and current theme using the `useTheme` hook
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the current window width for dynamic layout adjustments
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// useEffect hook to update windowWidth when the window is resized
	useEffect(() => {
		// Event handler to update state with the current window width
		const handleResize = () => setWindowWidth(window.innerWidth);

		// Attach resize event listener to the window
		window.addEventListener('resize', handleResize);

		// Cleanup the event listener when the component is unmounted
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Breakpoint constants for responsive design
	const isMobile = windowWidth <= 599;

	// Array of color configurations for feature cards
	const featureColors = [
		{ light: ColorsPalette.Teal400, dark: ColorsPalette.Teal700 },
		{ light: ColorsPalette.Green400, dark: ColorsPalette.Green700 },
		{ light: ColorsPalette.Lime400, dark: ColorsPalette.Lime700 },
		{ light: ColorsPalette.Yellow400, dark: ColorsPalette.Yellow700 },
		{ light: ColorsPalette.Red400, dark: ColorsPalette.Red700 },
	];

	return (
		<Page
			activeTab='Features'
			windowWidth={windowWidth}
			children={(
				<main style={{
					flexGrow: 1,
					position: 'relative',
					overflow: windowWidth > 599 ? 'auto' : 'unset',
					padding: windowWidth > 999 ? '40px 80px' : windowWidth > 599 ? '30px 40px' : '25px',
				}}>
					{/* Header Section */}
					<section style={{
						textAlign: 'center',
						maxWidth: windowWidth > 1199 ? '60%' : windowWidth > 599 ? '70%' : '100%',
						margin: 'auto',
						marginBottom: windowWidth > 999 ? '40px' : windowWidth > 599 ? '30px' : '25px',
					}}>
						{/* Page Title */}
						<h1 style={{
							color: isDarkMode ? colors.Solid900 : colors.Solid800,
							margin: '0 0 12px 0',
							fontSize: '20px',
							fontWeight: '600',
						}}>
							{title}
						</h1>

						{/* Description text explaining the features */}
						<p style={{
							fontSize: '12px',
							color: isDarkMode ? colors.Solid800 : colors.Solid700,
							textAlign: 'center',
							margin: 0,
						}}>
							{description}
						</p>
					</section>

					{/* Features Grid Section */}
					<section style={{
						display: 'grid',
						gridTemplateColumns: windowWidth > 1199 ? 'repeat(3, 1fr)' : windowWidth > 799 ? 'repeat(2, 1fr)' : '1fr',
						gap: '24px',
						maxWidth: isMobile ? '100%' : '90%',
						margin: '0 auto',
					}}>
						{/* Iterate through the features array and display each feature card */}
						{features.map((feature, index) => {
							const featureColor = featureColors[index % featureColors.length];
							return (
								<div
									key={index}
									style={{
										background: isDarkMode ? colors.Solid300 : colors.Solid100,
										borderRadius: '16px',
										padding: '24px',
										boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
										border: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
										transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
										cursor: isMobile ? 'none' : 'pointer',
										position: 'relative',
										overflow: 'hidden',
									}}
									onMouseEnter={(e) => {
										if (!isMobile) {
											e.currentTarget.style.transform = 'translateY(-4px)';
											e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? featureColor.dark : featureColor.light}1A`;
										}
									}}
									onMouseLeave={(e) => {
										if (!isMobile) {
											e.currentTarget.style.transform = 'translateY(0)';
											e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
										}
									}}
								>
									{/* Feature header containing icon and title */}
									<div style={{
										display: 'flex',
										alignItems: 'center',
										columnGap: '16px',
										marginBottom: '18px',
									}}>
										{/* Feature Icon with number indicator */}
										<div style={{
											flexShrink: 0,
											width: '32px',
											height: '32px',
											borderRadius: '6px',
											background: isDarkMode ? featureColor.dark : featureColor.light,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: colors.Solid100,
											fontSize: '14px',
											fontWeight: 'bold',
										}}>
											{index + 1}
										</div>

										{/* Feature Title with text overflow handling */}
										<h3 style={{
											fontSize: '14px',
											fontWeight: '600',
											color: isDarkMode ? featureColor.dark : featureColor.light,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											margin: 0,
											flex: 1,
											minWidth: 0
										}}>
											{feature.title}
										</h3>
									</div>

									{/* Feature Description */}
									<p style={{
										margin: 0,
										fontSize: '12px',
										color: isDarkMode ? colors.Solid1000 : colors.Solid700,
										opacity: 0.9,
									}}>
										{feature.description}
									</p>

									{/* Subtle Accent Line at the bottom of the card */}
									<div style={{
										position: 'absolute',
										bottom: 0,
										left: '24px',
										right: '24px',
										height: '2px',
										background: `linear-gradient(90deg, ${isDarkMode ? featureColor.dark : featureColor.light}, transparent)`,
										opacity: 0.6,
									}} />
								</div>
							);
						})}
					</section>
				</main>
			)}
		/>
	);
};

export default FeaturesPage;
