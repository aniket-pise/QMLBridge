import { ReactNode } from "react";
import { Alignment, Color } from "..";

/** 
 * SnackBarProps interface defines the properties for customizing the 
 * appearance, behavior, and animation of the SnackBar component.
 */
interface SnackBarProps {
	/** 
	 * The title displayed in the SnackBar.
	 * Typically used for a short headline or notification subject.
	 */
	title: string;

	/** 
	 * The message content displayed in the SnackBar.
	 * Can be any text providing more detailed information or context.
	 */
	message: string;

	/** 
	 * Optional custom icon to be displayed for closing the SnackBar.
	 * Can be an SVG icon or any React component.
	 */
	closeIcon?: ReactNode;

	/** 
	 * The background color of the SnackBar.
	 * Use a valid CSS color value (e.g., hex, rgba, rgb, named color).
	 * Defaults to a light gray background color.
	 */
	backgroundColor?: Color;

	/** 
	 * The color of the barrier that overlays the screen behind the SnackBar.
	 * This is typically a semi-transparent layer to focus the user’s attention on the SnackBar.
	 * Use a valid CSS color value (e.g., rgba(0, 0, 0, 0.5)).
	 */
	barrierColor?: Color;

	/** 
	 * The color of the title text.
	 * Use a valid CSS color value (e.g., hex, rgba, rgb, named color).
	 * Defaults to a light gray color.
	 */
	titleColor?: string;

	/** 
	 * The color of the message text.
	 * Use a valid CSS color value (e.g., hex, rgba, rgb, named color).
	 * Defaults to a slightly darker gray color than the title.
	 */
	messageColor?: Color;

	/** 
	 * The color of the close icon.
	 * Use a valid CSS color value (e.g., hex, rgba, rgb, named color).
	 * Defaults to the same color as the message text.
	 */
	closeIconColor?: Color;

	/** 
	 * Border radius of the SnackBar, controlling the roundness of the corners.
	 * Can be a string or number (e.g., "8px", "12px").
	 */
	borderRadius?: number | string;

	/** 
	 * The width of the SnackBar.
	 * Can be set to "auto", "min-content", "max-content", "fit-content", or a fixed width (e.g., "300px").
	 */
	width?: number | string;

	/** 
	 * The margin around the SnackBar component.
	 * Can be a valid CSS value (e.g., "16px", "2rem").
	 */
	margin?: number | string;

	/** 
	 * The padding inside the SnackBar for spacing between content and edges.
	 * Can be a valid CSS value (e.g., "16px", "1rem").
	 */
	padding?: number | string;

	/** 
	 * Elevation level (shadow) of the SnackBar.
	 * Defines how "raised" the SnackBar appears. Accepts CSS values like "2px", "4px", etc.
	 */
	elevation?: string;

	/** 
	 * The color of the shadow applied to the SnackBar.
	 * Use a valid CSS color value (e.g., hex, rgba, rgb).
	 */
	shadowColor?: Color;

	/** 
	 * Determines whether clicking the barrier will dismiss the SnackBar.
	 * Defaults to `true`, allowing the SnackBar to be dismissed when the user clicks the overlay.
	 */
	barrierDismissible?: boolean;

	/** 
	 * Duration in milliseconds before the SnackBar disappears automatically.
	 * A positive number with a unit (e.g., '3000ms' for 3 seconds). 
	 * Default value is '3000ms' (3 seconds).
	 */
	duration?: string;

	/** 
	 * Duration in milliseconds for the fade or slide-in animation.
	 * Defines how quickly the SnackBar appears when shown. 
	 * Default value is '300ms'.
	 */
	appearTime?: string;

	/** 
	 * Duration in milliseconds for the dismiss animation.
	 * Defines how long the SnackBar takes to disappear when dismissed.
	 * Default value is '300ms'.
	 */
	dismissTime?: string;

	/** 
	 * The type of animation used for the SnackBar.
	 * Can be either "fade" (opacity transition) or "slide" (vertical translation).
	 */
	animation?: 'fade' | 'slide';

	/** 
	 * The timing function for the animation.
	 * Defines how the animation progresses over time. Options: "ease", "ease-in", "ease-out", "ease-in-out", or "linear".
	 */
	animationTimingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';

	/** 
	 * The direction from which the SnackBar will dismiss.
	 * Possible values: "left", "right", "up", "down".
	 * Controls the animation when the SnackBar disappears.
	 */
	dismissDirection?: 'left' | 'right' | 'up' | 'down';

	/** 
	 * The location of the SnackBar on the screen.
	 * Can be one of the following: "left", "right", "top", "bottom", 
	 * or a combination of corner positions: "topLeft", "topRight", "bottomLeft", "bottomRight".
	 */
	location?: Alignment;

	/** 
	 * Callback function to be called when the SnackBar is closed (either automatically or manually).
	 * Useful for cleaning up or performing actions after the SnackBar is dismissed.
	 */
	onClose?: () => void;
}

export default SnackBarProps;
