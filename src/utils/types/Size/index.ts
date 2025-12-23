/**
 * Represents the dimensions of an object.
 * This interface defines the width and height properties,
 * which can be specified in numerical pixel values or predefined
 * string values that dictate how the object should size itself.
 */
interface Size {
	/** The width of the object, specified as a number (in pixels) or one of the predefined values: 
	 * 'auto', 'min-content', 'max-content', or 'fit-content'. */
	width: number | 'auto' | 'min-content' | 'max-content' | 'fit-content';

	/** The height of the object, specified similarly to the width with either a number (in pixels)
	 * or one of the predefined values. */
	height: number | 'auto' | 'min-content' | 'max-content' | 'fit-content';
}

export default Size;
