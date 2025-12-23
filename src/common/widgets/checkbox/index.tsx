import { MouseCursor, Color } from '../../../utils/types';
import { FC, useState, KeyboardEvent } from 'react';
import { useTheme } from '../../../utils/theme';

/**
 * Props for the CheckBox component.
 */
interface CheckBoxProps {
	/** Mouse cursor style when hovering over the checkbox. */
	mouseCursor?: MouseCursor;

	/** Background color when the checkbox is not checked. */
	fillColor?: Color;

	/** Color of the checkbox when active (checked). */
	activeColor?: Color;

	/** Color of the checkmark. */
	checkColor?: Color;

	/** Color of the outline when focused. */
	focusColor?: Color;

	/** Color of the outline when hovered. */
	hoverColor?: Color;

	/** Color of the splash effect when the checkbox is clicked. */
	overlayColor?: Color;

	/** Size of the checkbox (width and height) in pixels. */
	size?: number;

	/** Radius of the splash effect in pixels. */
	splashRadius?: number;

	/** Current checked state of the checkbox. */
	isChecked: boolean;

	/** Callback function triggered when the checkbox value changes. Receives the new checked state. */
	onChange: (value: boolean) => void;
}

/**
 * A customizable checkbox component.
 *
 * This component mimics the Material Design checkbox functionality and appearance.
 *
 * @param props - Props for the CheckBox component.
 * @returns A rendered checkbox element.
 */
const CheckBox: FC<CheckBoxProps> = ({
	isChecked,
	size = 10,
	splashRadius = 24,
	mouseCursor = 'pointer',
	fillColor = 'transparent',
	checkColor,
	focusColor,
	hoverColor,
	activeColor,
	overlayColor = 'rgba(0, 0, 0, 0.3)',
	onChange,
}) => {
	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors } = useTheme();

	// Local state to manage focus, hover, and splash effects
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const [isSplashVisible, setIsSplashVisible] = useState(false);

	/**
	 * Handles the click event to toggle the checkbox state.
	 * Triggers the splash effect when the checkbox is clicked.
	 */
	const handleClick = () => {
		// Toggle checked state
		onChange(!isChecked);

		// Show splash effect
		setIsSplashVisible(true);

		// Hide splash after delay
		setTimeout(() => setIsSplashVisible(false), 600);
	};

	/**
	 * Handles keyboard events for accessibility.
	 * Allows toggling the checkbox with space or enter key.
	 */
	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === ' ' || event.key === 'Enter') {
			// Prevent default behavior
			event.preventDefault();

			// Trigger click handler
			handleClick();
		}
	};

	// Helper function to determine the outline style based on focus and hover states
	const getOutlineStyle = () => {
		if (isFocused) return `2px solid ${focusColor ?? colors.Solid300A}`;
		if (isHovered) return `2px solid ${hoverColor ?? colors.Solid200A}`;
		return 'none';
	};

	// Helper function to determine the background color based on the checked state
	const getBackgroundColor = () => (isChecked ? (activeColor ?? colors.Solid400A) : fillColor);

	return (
		<div
			role='checkbox'
			tabIndex={0}
			aria-checked={isChecked}
			onBlur={() => setIsFocused(false)}
			onFocus={() => setIsFocused(true)}
			onKeyDown={handleKeyDown}
			style={{
				position: 'relative',
				width: splashRadius + size + 10,
				height: splashRadius + size + 10,
				outline: 'none',
				borderRadius: '50%',
			}}
		>
			{/**
        Renders a splash effect if isSplashVisible is true, 
        using the specified splashStyle for styling.
      */}
			{isSplashVisible && (
				<div style={{
					top: '50%',
					left: '50%',
					width: '100%',
					height: '100%',
					zIndex: -1,
					position: 'absolute',
					borderRadius: '50%',
					backgroundColor: overlayColor,
					transform: 'translate(-50%, -50%) scale(0)',
					animation: 'splash 600ms linear forwards',
				}} />
			)}

			{/** 
        Custom checkbox that handles click and hover interactions.
        Displays a checkmark if isChecked is true.
      */}
			<div
				onClick={handleClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					width: size,
					height: size,
					padding: 2,
					display: 'flex',
					border: '2px solid',
					cursor: mouseCursor,
					borderColor: activeColor ?? colors.Solid400A,
					borderRadius: 4,
					alignItems: 'center',
					justifyContent: 'center',
					transform: 'translate(-50%, -50%)',
					outline: getOutlineStyle(),
					backgroundColor: getBackgroundColor(),
					transition: 'background-color 0.2s, border 0.2s',
				}}
			>
				{/** Render checkmark if checked */}
				{isChecked && (
					<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg' fill={checkColor ?? colors.Solid100}>
						<path d='M176 331.856L412 95.9936C419.333 88.6645 428.667 85 440 85C451.333 85 460.667 88.6645 468 95.9936C475.333 103.323 479 112.651 479 123.977C479 135.304 475.333 144.632 468 151.961L204 415.807C196 423.802 186.667 427.8 176 427.8C165.333 427.8 156 423.802 148 415.807L44 311.868C36.6667 304.539 33 295.211 33 283.884C33 272.557 36.6667 263.229 44 255.9C51.3333 248.571 60.6667 244.907 72 244.907C83.3333 244.907 92.6667 248.571 100 255.9L176 331.856Z' />
					</svg>
				)}
			</div>

			{/** Defines the animation for the splash effect */}
			<style>{`
        @keyframes splash {
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
      `}</style>
		</div>
	);
};

export default CheckBox;
