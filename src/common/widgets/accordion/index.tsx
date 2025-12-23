import { FC, ReactNode, useState, useRef, useEffect } from "react";
import { useTheme } from "../../../utils/theme";

/**
 * Accordation component that displays a collapsible section with a title and content.
 * The content can be toggled open or closed by clicking on the title area.
 * 
 * @param title - The title or question displayed for the accordion item.
 * @param children - The content to be displayed when the accordion is opened.
 * @param style - Optional additional styles to apply to the component.
 */
const Accordation: FC<{
	title: ReactNode,
	children: ReactNode,
	style?: React.CSSProperties,
}> = ({ title, children, style }) => {
	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors, theme } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// State to track if the accordion content is opened or closed
	const [isOpened, setIsOpened] = useState<boolean>(false);

	// Reference to the content section for measuring its scrollHeight
	const contentRef = useRef<HTMLDivElement | null>(null);

	// State to track the maximum height of the content for smooth transitions
	const [maxHeight, setMaxHeight] = useState<number | string>(0);

	// useEffect hook to update maxHeight based on whether the accordion is open or closed
	useEffect(() => {
		if (contentRef.current) {
			// Set the maxHeight to the scrollHeight of the content if opened, otherwise 0
			setMaxHeight(isOpened ? contentRef.current.scrollHeight : 0);
		}
	}, [isOpened]); // Dependency on `isOpened` state to trigger the effect on toggle

	return (
		<div
			style={{
				padding: '12px 18px',
				borderRadius: '8px',
				backgroundColor: isDarkMode ? colors.Solid300 : colors.Solid100A,
				...style,
			}}
		>
			{/* Header section containing the title and toggle button */}
			<div
				aria-expanded={isOpened}
				role="button"
				onClick={() => setIsOpened(!isOpened)}
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					cursor: 'pointer',
					transition: 'height 0.3s ease-in-out',
				}}
			>
				{/* Accordion title displayed on the left side */}
				<h3
					style={{
						color: isDarkMode ? colors.Solid800 : colors.Solid700,
						margin: 0,
						fontSize: '12px',
						textAlign: 'left',
					}}
				>
					{title}
				</h3>

				{/* Button to toggle the accordion open/close */}
				<div
					style={{
						minWidth: '32px',
						minHeight: '32px',
						marginLeft: '16px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<div
						style={{
							width: '12px',
							height: '12px',
							display: 'flex',
							position: 'relative',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{/* Horizontal bar (Top/Bottom part of the accordion button) */}
						<span
							role="presentation"
							style={{
								width: '100%',
								height: '2px',
								display: 'block',
								position: 'absolute',
								transformOrigin: 'center',
								borderRadius: '1.8px',
								backgroundColor: isDarkMode ? colors.Solid800 : colors.Solid700,
							}}
						/>

						{/* Vertical bar (Middle part of the accordion button, rotates when opened) */}
						<span
							role="presentation"
							style={{
								width: '2px',
								height: '100%',
								display: 'block',
								position: 'absolute',
								transform: isOpened ? 'rotate(90deg)' : 'none',
								transformOrigin: 'center',
								borderRadius: '1.8px',
								backgroundColor: isDarkMode ? colors.Solid800 : colors.Solid700,
							}}
						/>
					</div>
				</div>
			</div>

			{/* Content section with smooth transition for height */}
			<div
				ref={contentRef}  // Ref to measure content height
				style={{
					overflow: 'hidden',
					maxHeight: `${maxHeight}px`,
					transition: 'max-height 0.3s ease-in-out',
				}}
			>
				{/* Conditionally render the content when the accordion is opened */}
				{isOpened && (
					<>
						{/* Divider line between title and content */}
						<hr
							style={{
								margin: '8px auto',
								border: 'none',
								borderTop: `1px solid ${isDarkMode ? colors.Solid300A : colors.Solid200A}`,
							}}
						/>

						{/* Accordion content */}
						<p
							style={{
								color: isDarkMode ? colors.Solid800 : colors.Solid700,
								margin: 0,
								fontSize: '12px',
							}}
						>
							{children}
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default Accordation;
