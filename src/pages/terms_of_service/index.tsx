import { useEffect, useState } from 'react';
import { Page } from '../../common/components';
import { useTheme } from '../../utils/theme';
import { title, description, terms_of_service } from './data';
import { ColorsPalette } from '../../utils/constants/colors';

/**
 * TermsOfServicePage component displays the terms and conditions of the service.
 * It features a responsive layout with modern card-based sections that adapt dynamically.
 * 
 * This page:
 * - Displays terms and conditions content in visually distinct, organized sections
 * - Adapts layout based on window width for optimal viewing on all devices
 * - Uses theme-aware colors and typography for consistent design language
 * - Provides clear visual hierarchy between main terms and sub-sections
 */
const TermsOfServicePage: React.FC = () => {
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

	// Array of color configurations for section cards
	const sectionColors = [
		{ light: ColorsPalette.Teal400, dark: ColorsPalette.Teal700 },
		{ light: ColorsPalette.Orange400, dark: ColorsPalette.Orange700 },
		{ light: ColorsPalette.Green400, dark: ColorsPalette.Green700 },
		{ light: ColorsPalette.Purple400, dark: ColorsPalette.Purple700 },
		{ light: ColorsPalette.Lime400, dark: ColorsPalette.Lime700 },
		{ light: ColorsPalette.Magenta400, dark: ColorsPalette.Magenta700 },
		{ light: ColorsPalette.Yellow400, dark: ColorsPalette.Yellow700 },
		{ light: ColorsPalette.Red400, dark: ColorsPalette.Red700 },
	];

	return (
		<Page
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

						{/* Description of the Terms of Service */}
						<p style={{
							fontSize: '12px',
							color: isDarkMode ? colors.Solid800 : colors.Solid700,
							textAlign: 'center',
							margin: 0,
						}}>
							{description}
						</p>
					</section>

					{/* Terms of Service Sections */}
					<section style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '24px',
						maxWidth: isMobile ? '100%' : '90%',
						margin: '0 auto',
					}}>
						{/* Iterate through the terms_of_service array and display each section */}
						{terms_of_service.map((section, index) => {
							// Color for section based on index
							const sectionColor = sectionColors[index % sectionColors.length];

							// Handle simple box sections
							if (section.type === 'box') {
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
											cursor: isMobile ? 'default' : 'pointer',
											position: 'relative',
											overflow: 'hidden',
										}}
										onMouseEnter={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateY(-4px)';
												e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? sectionColor.dark : sectionColor.light}1A`;
											}
										}}
										onMouseLeave={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
											}
										}}
									>
										{/* Section header containing icon and title */}
										<div style={{
											display: 'flex',
											alignItems: 'center',
											gap: '16px',
											marginBottom: '18px',
										}}>
											{/* Section Icon with number indicator */}
											<div style={{
												flexShrink: 0,
												width: '32px',
												height: '32px',
												borderRadius: '6px',
												background: isDarkMode ? sectionColor.dark : sectionColor.light,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												color: colors.Solid100,
												fontSize: '14px',
												fontWeight: 'bold',
											}}>
												{index + 1}
											</div>

											{/* Section Title with text overflow handling */}
											<h3 style={{
												fontSize: '14px',
												fontWeight: '600',
												color: isDarkMode ? sectionColor.dark : sectionColor.light,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												margin: 0,
												flex: 1,
												minWidth: 0,
											}}>
												{section.title}
											</h3>
										</div>

										{/* Section Description */}
										<p style={{
											margin: 0,
											fontSize: '12px',
											color: isDarkMode ? colors.Solid1000 : colors.Solid700,
											opacity: 0.9,
										}}>
											{section.data}
										</p>

										{/* Subtle Accent Line at the bottom of the card */}
										<div style={{
											position: 'absolute',
											bottom: 0,
											left: '24px',
											right: '24px',
											height: '2px',
											background: `linear-gradient(90deg, ${isDarkMode ? sectionColor.dark : sectionColor.light}, transparent)`,
											opacity: 0.6,
										}} />
									</div>
								);
							}

							// Handle sub-box sections with nested content
							else if (section.type === 'subBox') {
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
										// Hover effects for desktop devices only
										onMouseEnter={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateY(-4px)';
												e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? sectionColor.dark : sectionColor.light}1A`;
											}
										}}
										onMouseLeave={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
											}
										}}
									>
										{/* Section header containing icon and title */}
										<div style={{
											display: 'flex',
											alignItems: 'center',
											gap: '16px',
											marginBottom: '18px',
										}}>
											{/* Section Icon with number indicator */}
											<div style={{
												flexShrink: 0,
												width: '32px',
												height: '32px',
												borderRadius: '6px',
												background: isDarkMode ? sectionColor.dark : sectionColor.light,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												color: colors.Solid100,
												fontSize: '14px',
												fontWeight: 'bold',
											}}>
												{index + 1}
											</div>
											{/* Section Title with text overflow handling */}
											<h3 style={{
												fontSize: '14px',
												fontWeight: '600',
												color: isDarkMode ? sectionColor.dark : sectionColor.light,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												margin: 0,
												flex: 1,
												minWidth: 0,
											}}>
												{section.title}
											</h3>
										</div>

										{/* Sub-sections Grid */}
										<div style={{
											display: 'grid',
											gridTemplateColumns: windowWidth > 1199 ? 'repeat(3, 1fr)' : windowWidth > 799 ? 'repeat(2, 1fr)' : '1fr',
											gap: '16px',
											marginTop: '24px',
										}}>
											{/* Iterate through subContent entries and display each sub-section */}
											{Object.entries(section.subContent).map(([subKey, subValue], subIndex) => (
												<div
													key={subIndex}
													style={{
														padding: '16px',
														background: isDarkMode ? colors.Solid400 : colors.Solid200,
														borderRadius: '8px',
														border: `1px solid ${isDarkMode ? colors.Solid600 : colors.Solid400}`,
														transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
													}}
													onMouseEnter={(e) => {
														if (!isMobile) {
															e.currentTarget.style.transform = 'translateY(-4px)';
															e.currentTarget.style.borderColor = isDarkMode ? sectionColor.dark : sectionColor.light;
														}
													}}
													onMouseLeave={(e) => {
														if (!isMobile) {
															e.currentTarget.style.transform = 'translateY(0)';
															e.currentTarget.style.borderColor = isDarkMode ? colors.Solid600 : colors.Solid400;
														}
													}}
												>
													{/* Sub-section Title */}
													<h4 style={{
														margin: '0 0 10px 0',
														fontSize: '14px',
														fontWeight: '600',
														color: isDarkMode ? colors.Solid900 : colors.Solid600,
													}}>
														{subKey}
													</h4>

													{/* Sub-section Description */}
													<p style={{
														margin: 0,
														fontSize: '12px',
														color: isDarkMode ? colors.Solid900 : colors.Solid600,
														opacity: 0.9,
													}}>
														{subValue}
													</p>
												</div>
											))}
										</div>

										{/* Subtle Accent Line at the bottom of the card */}
										<div style={{
											position: 'absolute',
											bottom: 0,
											left: '24px',
											right: '24px',
											height: '2px',
											background: `linear-gradient(90deg, ${isDarkMode ? sectionColor.dark : sectionColor.light}, transparent)`,
											opacity: 0.6,
										}} />
									</div>
								);
							}
						})}
					</section>
				</main>
			)}
		/>
	);
};

export default TermsOfServicePage;
