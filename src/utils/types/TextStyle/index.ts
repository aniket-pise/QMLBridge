import { Color } from "..";

/**
 * Represents the style properties for text elements, including
 * font, decoration, spacing, and color attributes.
 */
interface TextStyle {
	/** Text color of the text element. */
	color?: Color;

	/** Text decoration style, such as underline or line-through. */
	decoration?: 'none' | 'underline' | 'overline' | 'line-through';

	/** Color of the text decoration. */
	decorationColor?: Color;

	/** Style of the text decoration, like solid or dotted. */
	decorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';

	/** Thickness of the text decoration. Can be 'auto' or a specific number. */
	decorationThickness?: 'auto' | number;

	/** Font family for the text element. */
	fontFamily?: string;

	/** Font size in pixels for the text. */
	fontSize?: number;

	/** Font style, either normal or italic. */
	fontStyle?: 'normal' | 'italic';

	/** Font weight, ranging from normal to bold with numeric values. */
	fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'initial' | 'inherit';

	/** Spacing between letters in the text. */
	letterSpacing?: 'normal' | number;

	/** Line height of the text line. */
	lineHeight?: 'normal' | number;

	/** Overflow behavior for the text element, either hidden or visible. */
	overflow?: 'hidden' | 'visible';

	/** Defines how overflowing text is handled (e.g., clipped, ellipsis). */
	textOverflow?: 'clip' | 'ellipsis' | 'string' | 'initial' | 'inherit';

	/** Shadow effect applied to the text. */
	shadow?: string | 'none';

	/** Spacing between words in the text. */
	wordSpacing?: 'normal' | number | 'initial' | 'inherit';
};

export default TextStyle;
