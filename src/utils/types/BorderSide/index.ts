import { Color } from "..";

/**
 * Defines the border properties for the button.
 */
interface BorderSide {
	/** Color of the border */
	color: Color;

	/** Width of the border in pixels */
	width: number | string;

	/** Style of the border */
	style: 'solid' | 'none';
}

export default BorderSide;
