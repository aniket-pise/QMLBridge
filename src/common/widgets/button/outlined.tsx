import { ButtonStyle, TextStyle } from '../../../utils/types';
import { alignItems, justifyContent } from '../../../utils/helpers/get-alignment';
import { ColorsPalette, DarkModeNeutrals, LightModeNeutrals } from '../../../utils/constants/colors';
import { CSSProperties, FC, ReactNode, useRef, useState } from 'react';
import { useTheme } from '../../../utils/theme';

/**
 * Props for the OutlinedButton component.
 * Defines the structure and available options for customizing button appearance, behavior, 
 * and interaction, such as callbacks for hover, press, and long-press actions.
 */
interface OutlinedButtonProps {
	/** Custom style overrides for the button, merging with default button styling. */
	buttonStyle?: ButtonStyle;

	/** The content to be displayed inside the button, such as text or icons. */
	child?: ReactNode;

	/** Specifies whether the button is enabled (true) or disabled (false). */
	enabled?: boolean;

	/** Text style for customizing the appearance of the button's text. */
	textStyle?: TextStyle;

	/** Callback function that is triggered when the button is hovered over. */
	onHover?: (value: boolean) => void;

	/** Callback function that is triggered on a long press of the button (500ms hold). */
	onLongPressed?: () => void;

	/** Callback function that is triggered when the button is clicked or tapped. */
	onPressed?: () => void;

	/** Callback function that is triggered when the mouse enters the button */
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

	/** Callback function that is triggered when the mouse leaves the button */
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * OutlinedButton Component
 * A customizable button with ripple effect, hover, active, and long press states.
 * Supports custom content, styling, and state-based behaviors for enhanced UI interaction.
 */
const OutlinedButton: FC<OutlinedButtonProps> = ({
	child,
	buttonStyle: incomingButtonStyle = {},
	textStyle: incomingTextStyle = {},
	enabled = true,
	onHover,
	onPressed,
	onLongPressed,
	onMouseEnter,
	onMouseLeave,
}) => {
	// Retrieves the theme colors from the current theme using the `useTheme` hook
	const { colors, theme } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// Default text style configuration for the button, customizable with incoming overrides.
	const textStyle: TextStyle = {
		color: isDarkMode ? DarkModeNeutrals.Solid1000 : LightModeNeutrals.Solid800,
		decoration: 'none',
		decorationColor: 'transparent',
		decorationStyle: 'solid',
		decorationThickness: 'auto',
		fontSize: 14,
		fontFamily: 'Poppins',
		fontStyle: 'normal',
		fontWeight: 'normal',
		letterSpacing: 'normal',
		lineHeight: 'normal',
		overflow: 'hidden',
		shadow: 'none',
		textOverflow: 'clip',
		wordSpacing: 'normal',
		...incomingTextStyle,
	};

	// Define default button styling and allow incoming style overrides.
	const buttonStyle: ButtonStyle = {
		alignment: 'center',
		padding: '12px 18px',
		mouseCursor: 'pointer',
		borderRadius: 8,
		primaryColor: 'transparent',
		hoverColor: (isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime100) + '4A',
		activeColor: (isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime100) + '4A',
		disabledColor: colors.Solid400,
		focusColor: isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime100,
		overlayColor: (isDarkMode ? ColorsPalette.Lime500 : ColorsPalette.Lime1000) + '0F',
		outline: {
			width: 2,
			style: 'solid',
			color: isDarkMode ? ColorsPalette.Teal600 : ColorsPalette.Teal400,
		},
		fixedSize: { width: 'auto', height: 'auto' },
		borderSide: {
			width: 2,
			style: 'solid',
			color: isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime400,
		},
		...incomingButtonStyle,
	};

	// Tracks whether the button is currently hovered
	const [isHovered, setIsHovered] = useState(false);

	// Tracks whether the button is in an active (pressed) state
	const [isActive, setIsActive] = useState(false);

	// Stores the style properties for the ripple effect, initially hidden
	const [rippleStyle, setRippleStyle] = useState<CSSProperties>({ display: 'none' });

	// Reference to the button DOM element, used for calculating positions for effects
	const buttonRef = useRef<HTMLDivElement>(null);

	// Timeout reference for long-press detection, cleared if press is too short
	const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

	// Timeout reference for managing the duration of the ripple effect
	const rippleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Handles the key up event for keyboard interaction, activating the button if the key is released
	const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => activateKey(event, false);

	// Handles the key down event for keyboard interaction, activating the button if the key is pressed
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => activateKey(event, true);

	// Handles the mouse up event, stopping the ripple effect when the mouse button is released
	const handleMouseUp = () => stopRipple();

	// Handles the mouse down event, starting the ripple effect when the mouse button is pressed
	const handleMouseDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => startRipple(event);

	// Mouse enter logic for hover effects
	const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// Toggle the hover state of the button to true
		toggleHover(true);

		// Trigger the custom onMouseEnter callback if provided in the props
		onMouseEnter?.(event);
	};

	// Mouse leave logic for hover effects
	const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		// Toggle the hover state of the button to false
		toggleHover(false);

		// Trigger the custom onMouseLeave callback if provided in the props
		onMouseLeave?.(event);
	};

	/**
	 * Toggles the hover state of the button.
	 * 
	 * @param hovered - A boolean value indicating whether the button is currently hovered (true) or not (false).
	 * 
	 * If the button is enabled, updates the internal state to reflect the hover status
	 * and optionally calls the onHover callback function to notify external components
	 * about the hover state change.
	 */
	const toggleHover = (hovered: boolean) => {
		// Check if the button is enabled before proceeding
		if (enabled) {
			// Update the hover state based on the hovered parameter
			setIsHovered(hovered);

			// Call the onHover callback function, if provided, to notify about the hover state
			onHover?.(hovered);
		}
	};

	/**
	 * Calculates the position and size for the ripple effect based on the event coordinates.
	 * 
	 * @param event - The mouse or touch event used to determine the ripple's starting position.
	 * 
	 * The function retrieves the button's dimensions and calculates:
	 * - The size of the ripple (based on the button's dimensions).
	 * - The coordinates for the ripple effect (centered on the click/touch point).
	 * 
	 * @returns An object containing the x and y coordinates for the ripple's position, 
	 *          along with the calculated size.
	 */
	const calculateRipple = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
		// Get the current button element from the event
		const button = event.currentTarget;

		// Retrieve the dimensions and position of the button
		const rect = button.getBoundingClientRect();

		// Determine the size of the ripple, which should be the larger dimension of the button
		const size = Math.max(rect.width, rect.height);

		// Check if the event is a touch event (for mobile support)
		const isTouchEvent = 'touches' in event;

		// Calculate the x coordinate for the ripple, centering it based on the size
		const x = isTouchEvent
			? (event as React.TouchEvent<HTMLDivElement>).touches[0].clientX - rect.left - size / 2
			: (event as React.MouseEvent<HTMLDivElement>).clientX - rect.left - size / 2;

		// Calculate the y coordinate for the ripple, centering it based on the size
		const y = isTouchEvent
			? (event as React.TouchEvent<HTMLDivElement>).touches[0].clientY - rect.top - size / 2
			: (event as React.MouseEvent<HTMLDivElement>).clientY - rect.top - size / 2;

		// Return the calculated x, y coordinates and the ripple size
		return { x, y, size };
	};

	/**
	 * Initiates the ripple effect when the button is pressed.
	 * 
	 * @param event - The mouse or touch event that triggered the ripple effect.
	 * 
	 * If the button is enabled, this function:
	 * - Sets a timeout for detecting a long press (if applicable).
	 * - Activates the button's active state.
	 * - Calculates the ripple coordinates and updates the ripple style for animation.
	 */
	const startRipple = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
		// Check if the button is enabled before proceeding with the ripple effect
		if (enabled) {
			// If a long press handler is provided, set a timeout to trigger it after 500ms
			if (onLongPressed) {
				longPressTimeout.current = setTimeout(onLongPressed, 500);
			}

			// Set the button to active state to indicate it's being pressed
			setIsActive(true);

			// Calculate the coordinates for the ripple effect based on the event
			const rippleCoords = calculateRipple(event);

			// Update the ripple style with calculated properties for the animation
			setRippleStyle({
				top: rippleCoords.y,
				left: rippleCoords.x,
				width: rippleCoords.size,
				height: rippleCoords.size,
				display: 'block',
				position: 'absolute',
				pointerEvents: 'none',
				borderRadius: '50%',
				background: buttonStyle.overlayColor,
				transform: 'scale(0)',
				animation: 'ripple 600ms linear forwards',
			});
		}
	};

	/**
	 * Stops the ripple effect and clears any long-press timeouts.
	 * 
	 * If the button is enabled, this function will:
	 * - Call the onPressed callback if provided.
	 * - Deactivate the button's active state.
	 * - Schedule the ripple style to be hidden after a short delay.
	 */
	const stopRipple = () => {
		// Clear the long-press timeout if it exists to prevent triggering the long-press action
		if (longPressTimeout.current) clearTimeout(longPressTimeout.current);

		// If the button is enabled, call the onPressed callback if it's defined
		if (enabled) onPressed?.();

		// Set the button's active state to false, indicating it is no longer pressed
		setIsActive(false);

		// Schedule the ripple style to be hidden after 600ms to allow for the animation to complete
		rippleTimeoutRef.current = setTimeout(() => setRippleStyle({ display: 'none' }), 600);
	};

	// Default CSS properties for styling the text inside the button.
	const buttonTextStyle: CSSProperties = {
		color: textStyle.color,
		textDecoration: textStyle.decoration,
		textDecorationColor: textStyle.decorationColor,
		textDecorationStyle: textStyle.decorationStyle,
		textDecorationThickness: textStyle.decorationThickness,
		fontFamily: textStyle.fontFamily,
		fontSize: textStyle.fontSize,
		fontStyle: textStyle.fontStyle,
		fontWeight: textStyle.fontWeight,
		letterSpacing: textStyle.letterSpacing,
		lineHeight: textStyle.lineHeight,
		overflow: textStyle.overflow,
		textOverflow: textStyle.textOverflow,
		textShadow: textStyle.shadow,
		wordSpacing: textStyle.wordSpacing,
	};

	/**
	 * Activates button press when Enter key is pressed and held down.
	 * 
	 * @param event - Keyboard event to check for Enter key.
	 * @param active - true if key is down, false when released.
	 * 
	 * If the Enter key is pressed and the button is enabled:
	 * - Updates the button's active state based on the key's current state.
	 * - Calls the onPressed callback if the key is pressed down.
	 */
	const activateKey = (event: React.KeyboardEvent<HTMLDivElement>, active: boolean) => {
		// Check if the pressed key is 'Enter' and the button is enabled
		if (event.key === 'Enter' && enabled) {
			// Set the active state of the button based on whether the key is pressed or released
			setIsActive(active);

			// If the key is currently pressed down, call the onPressed callback if defined
			if (active) onPressed?.();
		}
	};

	/**
	 * Determines button background color based on current state.
	 * 
	 * The function checks the button's enabled, active, and hovered states to
	 * return the appropriate background color for the button.
	 * 
	 * @returns The background color corresponding to the button's current state.
	 */
	const getButtonBackgroundColor = () => {
		// Return the disabled color if the button is not enabled
		if (!enabled) return buttonStyle.disabledColor;

		// Return the active color if the button is currently active (pressed)
		if (isActive) return buttonStyle.activeColor;

		// Return the hover color if the button is currently hovered
		if (isHovered) return buttonStyle.hoverColor;

		// Return the primary color as the default state
		return buttonStyle.primaryColor;
	};

	/**
	 * Determines button border color based on current state.
	 * 
	 * The function checks the button's enabled, active, and hovered states to
	 * return the appropriate border color for the button.
	 * 
	 * @returns The border color corresponding to the button's current state.
	 */
	const getBorderColor = () => {
		// Return the disabled color if the button is not enabled
		if (!enabled) return buttonStyle.disabledColor;

		// Return the primary color as the default state
		return buttonStyle.borderSide!.color;
	};

	// Define styles based on button properties
	// Set the button's opacity based on whether it is enabled
	const opacityStyle = enabled ? 1 : 0.6;

	// Set the cursor style based on whether the button is enabled
	const cursorStyle = enabled ? buttonStyle.mouseCursor : 'not-allowed';

	// Define the style properties for the button container using CSSProperties
	const buttonContainerStyle: CSSProperties = {
		width: buttonStyle.fixedSize!.width,
		height: buttonStyle.fixedSize!.height,
		display: 'flex',
		overflow: 'hidden',
		position: 'relative',
		userSelect: 'none',
		cursor: cursorStyle,
		opacity: opacityStyle,
		padding: buttonStyle.padding,
		borderStyle: buttonStyle.borderSide!.style,
		borderColor: getBorderColor(),
		borderWidth: buttonStyle.borderSide!.width,
		borderRadius: buttonStyle.borderRadius,
		alignItems: alignItems(buttonStyle.alignment!),
		justifyContent: justifyContent(buttonStyle.alignment!),
		transition: buttonStyle.transition ?? 'unset',
		boxShadow: buttonStyle.boxShadow ?? 'unset',
		background: buttonStyle.background ?? getButtonBackgroundColor(),
		...buttonTextStyle,
	};

	return (
		<div
			role='button'
			ref={buttonRef}
			tabIndex={0}
			style={buttonContainerStyle}
			onKeyUp={handleKeyUp}
			onKeyDown={handleKeyDown}
			onMouseUp={handleMouseUp}
			onMouseDown={handleMouseDown}
			onTouchEnd={handleMouseUp}
			onTouchStart={handleMouseDown}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className='outlined-button'
		>
			{/* Ripple effect element */}
			{/* 
        This <div> represents the ripple effect that is displayed when the button is pressed.
        The style for this element is dynamically controlled by the rippleStyle state.
        The ripple animation will scale and fade out over time, creating a visual feedback effect.
      */}
			<div style={rippleStyle} />

			{/* Render the button's child elements (content) */}
			{/* 
        This renders any child components or content that are passed to the OutlinedButton component.
        This could be text, icons, or other React elements that are intended to be displayed inside the button.
      */}
			{child}

			{/* 
        Inline style for button focus and ripple animation.
        This style block contains CSS that applies to the button when focused and defines the ripple effect animation.
      */}
			<style>
				{`
          /* Style applied to the button when it is focused (for accessibility) */
          .outlined-button:focus-visible {
            outline: ${buttonStyle.outline!.width}px ${buttonStyle.outline!.style} ${buttonStyle.outline!.color};
          }

          /* Removes the outline when the button is both focused and hovered for a cleaner appearance. */
          .outlined-button:focus-visible:hover {
            outline: none;
          }

          /* Keyframes for the ripple animation */
          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }
        `}
			</style>
		</div>
	);
};

export default OutlinedButton;
