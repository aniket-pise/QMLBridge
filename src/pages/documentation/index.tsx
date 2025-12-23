import { useEffect, useState } from 'react';
import { Page } from '../../common/components';
import { useTheme } from '../../utils/theme';
import { title, description, steps } from './data';
import { ColorsPalette } from '../../utils/constants/colors';

/**
 * DocumentationPage component displays the documentation for the service or product.
 * It features a responsive layout that adjusts dynamically based on the window width.
 * 
 * The page includes:
 * - A title and description section for the documentation.
 * - A step-by-step guide with numbered cards, each with a title and description.
 * - A dynamic, responsive layout that adjusts padding and layout based on the window size.
 * 
 * It utilizes React hooks (`useState`, `useEffect`) to manage window resizing and adjust styles accordingly.
 */
const DocumentationPage: React.FC = () => {
	// Retrieves the theme colors and current theme using the `useTheme` hook
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the current window width for responsive styling
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// Effect hook to update window width on window resize
	useEffect(() => {
		// Handler to update the window width state
		const handleResize = () => setWindowWidth(window.innerWidth);

		// Add event listener to handle window resizing
		window.addEventListener('resize', handleResize);

		// Cleanup the event listener when the component is unmounted
		return () => window.removeEventListener('resize', handleResize);
	}, []);  // Empty dependency array ensures this effect runs once on mount

	// Breakpoint constants for responsive design
	const isMobile = windowWidth <= 599;

	// Array of color configurations for step cards
	const stepColors = [
		{ light: ColorsPalette.Teal400, dark: ColorsPalette.Teal700 },
		{ light: ColorsPalette.Green400, dark: ColorsPalette.Green700 },
		{ light: ColorsPalette.Lime400, dark: ColorsPalette.Lime700 },
		{ light: ColorsPalette.Yellow400, dark: ColorsPalette.Yellow700 },
		{ light: ColorsPalette.Red400, dark: ColorsPalette.Red700 },
	];

	return (
		<Page
			activeTab='Documentation'
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

						{/* Description paragraph about the documentation */}
						<p style={{
							fontSize: '12px',
							color: isDarkMode ? colors.Solid800 : colors.Solid700,
							textAlign: 'center',
							margin: 0,
						}}>
							{description}
						</p>
					</section>

					{/* Steps Section */}
					<section style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '24px',
						maxWidth: isMobile ? '100%' : '90%',
						margin: '0 auto',
						position: 'relative',
					}}>
						{/* Progress Line */}
						<div style={{
							position: 'absolute',
							left: '16px',
							top: `calc((100% / ${steps.length}) * 0.5)`,
							bottom: `calc((100% / ${steps.length}) * 0.5)`,
							width: '2px',
							background: `linear-gradient(
                to bottom,
                ${ColorsPalette.Teal400},
                ${ColorsPalette.Green400},
                ${ColorsPalette.Lime400},
                ${ColorsPalette.Yellow400},
                ${ColorsPalette.Red400}
              )`,
							opacity: 0.3,
							zIndex: 0,
						}} />

						{/* Iterates over the `steps` array to render each step */}
						{steps.map((step, index) => {
							const stepColor = stepColors[index % stepColors.length];
							return (
								<div
									key={index}
									style={{
										display: 'flex',
										alignItems: 'flex-start',
										gap: '24px',
										position: 'relative',
										zIndex: 1,
									}}
								>
									{/* Step Number Indicator */}
									<div style={{
										flexShrink: 0,
										width: '32px',
										height: '32px',
										margin: 'auto 0',
										borderRadius: '50%',
										background: isDarkMode ? stepColor.dark : stepColor.light,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: colors.Solid100,
										fontSize: '14px',
										fontWeight: 'bold',
									}}>
										{index + 1}
									</div>

									{/* Step Content Card */}
									<div style={{
										flex: 1,
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
												e.currentTarget.style.transform = 'translateX(4px)';
												e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? stepColor.dark : stepColor.light}1A`;
											}
										}}
										onMouseLeave={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateX(0)';
												e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
											}
										}}
									>
										{/* Step Title */}
										<h3 style={{
											fontSize: '14px',
											fontWeight: '600',
											color: isDarkMode ? stepColor.dark : stepColor.light,
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											margin: '0 0 16px 0',
											flex: 1,
											minWidth: 0,
										}}>
											{step.title}
										</h3>

										{/* Step Description */}
										<p style={{
											margin: 0,
											fontSize: '12px',
											color: isDarkMode ? colors.Solid1000 : colors.Solid700,
											opacity: 0.9,
										}}>
											{step.description}
										</p>

										{/* Subtle Accent Line */}
										<div style={{
											position: 'absolute',
											bottom: 0,
											left: '24px',
											right: '24px',
											height: '2px',
											background: `linear-gradient(90deg, ${isDarkMode ? stepColor.dark : stepColor.light}, transparent)`,
											opacity: 0.6,
										}} />
									</div>
								</div>
							);
						})}
					</section>
				</main>
			)}
		/>
	);
};

export default DocumentationPage;
