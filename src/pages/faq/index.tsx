import { useState, useEffect } from "react";
import { Page } from "../../common/components";
import { useTheme } from "../../utils/theme";
import { description, faqs, title } from "./data";
import Accordation from "../../common/widgets/accordion";

/**
 * FaqsPage component displays a list of frequently asked questions (FAQs).
 * It includes responsive layout adjustments based on window resizing.
 * 
 * The page consists of:
 * - A title section displaying the main title and description.
 * - A list of FAQs, each displayed in an accordion-style widget.
 * - Dynamic padding based on the window width for responsiveness.
 * 
 * Uses React hooks to handle window resizing and dynamically adjusts content layout.
 */
const FaqsPage: React.FC = () => {
	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors, theme } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track the current window width for dynamic layout adjustments
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// useEffect hook to update windowWidth when the window is resized
	useEffect(() => {
		// Function to update the window width in state
		const handleResize = () => setWindowWidth(window.innerWidth);

		// Attach resize event listener to the window to adjust layout
		window.addEventListener('resize', handleResize);

		// Cleanup: remove the event listener when the component is unmounted
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<Page
			windowWidth={windowWidth}
			children={(
				<main style={{
					flexGrow: 1,
					textAlign: 'justify',
					color: colors.Solid900,
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

						{/* Description paragraph about the faqs */}
						<p style={{
							fontSize: '12px',
							color: isDarkMode ? colors.Solid800 : colors.Solid700,
							textAlign: 'center',
							margin: 0,
						}}>
							{description}
						</p>
					</section>

					{/* Section displaying the list of FAQs */}
					<section style={{ marginTop: '25px' }}>
						{/* Iterate over the FAQs and display each one in an Accordion */}
						{faqs.map((faq, index) => (
							<Accordation
								key={index}
								title={faq.title}
								children={faq.data}
								style={{
									marginBottom: index === faqs.length - 1 ? '0' : '10px',
									textAlign: 'initial',
								}}
							/>
						))}
					</section>
				</main>
			)}
		/>
	);
}

export default FaqsPage;
