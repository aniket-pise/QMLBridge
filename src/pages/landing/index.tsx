import IllustrationSVGLight from '../../assets/images/svg/light/Illustration.svg';
import IllustrationSVGDark from '../../assets/images/svg/dark/Illustration.svg';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '../../common/components';
import { FilledButton, OutlinedButton } from '../../common/widgets';
import { ColorsPalette } from '../../utils/constants/colors';
import { useTheme } from '../../utils/theme';
import { title, description, keyFeatures } from './data';

/**
 * LandingPage component renders the main landing page with consistent design
 * patterns. It follows the same responsive, theme-aware patterns as other
 * pages in the application.
 * 
 * The page features:
 * - Responsive layout with consistent breakpoints
 * - Theme-aware colors and typography
 * - Gradient accent elements matching other pages
 * - Consistent card-based design language
 * - Standardized button components with hover effects
 */
const LandingPage: React.FC = () => {
	// Retrieves the theme colors and current theme using the `useTheme` hook
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the current window width for dynamic layout adjustments
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// Hook for programmatic navigation
	const navigate = useNavigate();

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

	return (
		<Page
			windowWidth={windowWidth}
			children={(
				<main style={{
					flexGrow: 1,
					gap: '25px',
					margin: '0 auto',
					display: 'flex',
					alignItems: 'center',
					justifyContent: windowWidth > 1440 ? 'space-between' : 'unset',
					flexDirection: windowWidth > 1440 ? 'row' : 'column',
					overflow: windowWidth > 599 ? 'auto' : 'unset',
					padding: windowWidth > 999 ? '40px 80px' : windowWidth > 599 ? '30px 40px' : '25px',
					maxWidth: windowWidth > 1440 ? '80%' : windowWidth > 699 ? '70%' : '100%',
				}}>
					{/* Text Content Section - Contains title, description, buttons, and feature highlights */}
					<section style={{
						flex: 1,
						alignContent: 599 < windowWidth && windowWidth < 1440 ? 'center' : 'unset',
						textAlign: windowWidth > 1440 ? 'left' : 'center',
					}}>
						{/* Content container for title and description */}
						<div>
							{/* Page Title with consistent styling */}
							<h1 style={{
								marginBottom: '24px',
								color: isDarkMode ? colors.Solid900 : colors.Solid800,
								fontSize: windowWidth > 999 ? '32px' : windowWidth > 599 ? '28px' : '24px',
								fontWeight: '700',
								lineHeight: 1.35,
							}}>
								{title}
							</h1>

							{/* Description with consistent typography */}
							<p style={{
								margin: 0,
								fontSize: '14px',
								color: isDarkMode ? colors.Solid800 : colors.Solid700,
								lineHeight: 1.45,
							}}>
								{description}
							</p>
						</div>

						{/* Action Buttons Section */}
						<div style={{
							display: 'flex',
							gap: '16px',
							margin: '42px 0',
							flexWrap: 'wrap',
							justifyContent: windowWidth > 1440 ? 'flex-start' : 'center',
						}}>
							{/* Primary Action Button - Navigates to transformation page */}
							<FilledButton
								child={'Get Started'}
								buttonStyle={{
									background: `linear-gradient(
										45deg,
										${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400},
										${isDarkMode ? ColorsPalette.Lime400 : ColorsPalette.Lime700}
									)`,
									borderSide: {
										color: 'unset',
										width: 0,
										style: 'none',
									},
									padding: '12px 24px',
									transition: 'all 0.3s ease',
									boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
								}}
								textStyle={{
									color: colors.Solid100,
									fontSize: 14,
									fontWeight: 600,
								}}
								onPressed={() => navigate('/transform')}
								onMouseEnter={(e) => {
									if (!isMobile) {
										e.currentTarget.style.transform = 'translateY(-2px)';
										e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400}1A`;
									}
								}}
								onMouseLeave={(e) => {
									if (!isMobile) {
										e.currentTarget.style.transform = 'translateY(0)';
										e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
									}
								}}
							/>

							{/* Secondary Action Button - Navigates to documentation page */}
							<OutlinedButton
								child={'Learn More'}
								buttonStyle={{
									padding: '12px 24px',
									transition: 'all 0.3s ease',
									boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
								}}
								textStyle={{
									color: isDarkMode ? ColorsPalette.Lime400 : ColorsPalette.Lime600,
									fontSize: 14,
									fontWeight: 600,
								}}
								onPressed={() => navigate('/documentation')}
								onMouseEnter={(e) => {
									if (!isMobile) {
										e.currentTarget.style.transform = 'translateY(-2px)';
										e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? colors.Solid200A : colors.Solid300A}`;
									}
								}}
								onMouseLeave={(e) => {
									if (!isMobile) {
										e.currentTarget.style.transform = 'translateY(0)';
										e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
									}
								}}
							/>
						</div>

						{/* Feature Highlights Section */}
						<div style={{ justifySelf: 599 < windowWidth && windowWidth < 1440 ? 'center' : 'unset' }}>
							{/* Section Title */}
							<h3 style={{
								fontSize: '14px',
								fontWeight: '600',
								color: isDarkMode ? colors.Solid900 : colors.Solid800,
								margin: '0 0 18px 0',
							}}>
								Key Features
							</h3>

							{/* Features Grid - Matching other pages' card design */}
							<div style={{
								gap: '16px',
								display: 'grid',
								gridTemplateColumns: windowWidth > 599 ? 'repeat(2, 1fr)' : '1fr',
							}}>
								{/* Feature cards with hover effects */}
								{keyFeatures.map((feature, index) => (
									<div
										key={index}
										style={{
											gap: '14px',
											background: isDarkMode ? colors.Solid300 : colors.Solid100,
											borderRadius: '12px',
											padding: '16px',
											display: 'flex',
											alignItems: 'center',
											position: 'relative',
											boxShadow: `0 4px 8px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
											border: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
											transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
											cursor: isMobile ? 'none' : 'pointer',
										}}
										onMouseEnter={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateY(-2px)';
												e.currentTarget.style.boxShadow = `0 8px 16px ${isDarkMode ? feature.color.dark : feature.color.light}1A`;
											}
										}}
										onMouseLeave={(e) => {
											if (!isMobile) {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = `0 4px 8px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
											}
										}}
									>
										{/* Feature Icon Circle with number indicator */}
										<div style={{
											flexShrink: 0,
											width: '32px',
											height: '32px',
											borderRadius: '8px',
											background: isDarkMode ? feature.color.dark : feature.color.light,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: colors.Solid100,
											fontSize: '14px',
											fontWeight: 'bold',
										}}>
											{index + 1}
										</div>

										{/* Feature Content Container */}
										<div style={{ flex: 1 }}>
											{/* Feature Title */}
											<h4 style={{
												fontSize: '12px',
												fontWeight: '600',
												color: isDarkMode ? feature.color.dark : feature.color.light,
												margin: '0 0 2px 0',
												textAlign: 'left',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}>
												{feature.title}
											</h4>

											{/* Feature Description */}
											<p style={{
												margin: 0,
												fontSize: '11px',
												textAlign: 'left',
												color: isDarkMode ? colors.Solid800 : colors.Solid600,
												opacity: 0.9,
											}}>
												{feature.description}
											</p>
										</div>

										{/* Accent Line - Bottom gradient decoration */}
										<div style={{
											position: 'absolute',
											bottom: 0,
											left: '16px',
											right: '16px',
											height: '2px',
											background: `linear-gradient(90deg, ${isDarkMode ? feature.color.dark : feature.color.light}, transparent)`,
											opacity: 0.6,
										}} />
									</div>
								))}
							</div>
						</div>
					</section>

					{/* Decorative Visual Section - Only displayed on large screens (>1440px) */}
					{windowWidth > 1440 && (
						<section style={{
							flex: 1,
							display: 'flex',
							justifyContent: 'flex-end',
							alignItems: 'center',
							position: 'relative',
						}}>
							{/* Decorative card element matching design language */}
							<div style={{
								width: 'calc(100% * 0.75)',
								position: 'relative',
								overflow: 'hidden',
								borderRadius: '18px',
								background: `linear-gradient(135deg, ${isDarkMode ? colors.Solid300 : colors.Solid100} 0%, transparent 100%)`,
								border: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
								boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
							}}>
								{/* Theme-aware illustration */}
								<img
									src={isDarkMode ? IllustrationSVGDark : IllustrationSVGLight}
									style={{ width: '100%' }}
								/>

								{/* Accent line matching card design pattern */}
								<div style={{
									position: 'absolute',
									bottom: 0,
									left: '20px',
									right: '20px',
									height: '2px',
									background: `linear-gradient(
										90deg,
										${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400},
										${isDarkMode ? ColorsPalette.Green700 : ColorsPalette.Green400},
										transparent
									)`,
									opacity: 0.6,
								}} />
							</div>
						</section>
					)}
				</main>
			)}
		/>
	);
};

export default LandingPage;
