import { Alignment, BorderSide, Color, MouseCursor, Size } from "..";

/**
 * Styling options for the FilledButton component.
 */
interface ButtonStyle {
	/** Alignment of the button's child content */
	alignment?: Alignment;

	/** Background image or color for the button */
	background?: string;

	/** Background color of the button */
	primaryColor?: Color | string;

	/** Active color of the button when pressed */
	activeColor?: Color | string;

	/** Hover color of the button when mouse is over */
	hoverColor?: Color | string;

	/** Disabled color of the button when not interactable */
	disabledColor?: Color;

	/** Focus color of the button when focused */
	focusColor?: Color;

	/** Color of the overlay when the button is pressed */
	overlayColor?: Color | string;

	/** Border radius of the button for rounded corners */
	borderRadius?: number | string;

	/** Fixed size of the button */
	fixedSize?: Size;

	/** Mouse cursor style when hovering over the button */
	mouseCursor?: MouseCursor;

	/** Padding around the button's content */
	padding?: string | number;

	/** Outline styling */
	outline?: BorderSide;

	/** Border styling */
	borderSide?: BorderSide;

	/** CSS transition property for smooth state changes (e.g., hover, active, etc.) */
	transition?: string;

	/** Box shadow for the button to create a shadow effect around the button */
	boxShadow?: string;
}

export default ButtonStyle;
