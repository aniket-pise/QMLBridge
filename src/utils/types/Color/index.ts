/**
 * Defines a comprehensive set of color options as string literals.
 * These colors include basic colors, shades, and named colors 
 * in various categories (e.g., primary, secondary, and pastel).
 */
export type Colors =
	| 'black' | 'white' | 'red' | 'lightred' | 'darkred'
	| 'gray' | 'lightgrey' | 'pink' | 'lightpink' | 'darkpink'
	| 'cyan' | 'lightcyan' | 'darkcyan' | 'lime' | 'darklime'
	| 'navy' | 'lightnavy' | 'teal' | 'lightteal'
	| 'blue' | 'lightblue' | 'darkblue' | 'green' | 'lightgreen' | 'darkgreen'
	| 'olive' | 'lightolive' | 'brown' | 'lightbrown' | 'darkbrown'
	| 'maroon' | 'lightmaroon' | 'silver' | 'lightsilver'
	| 'yellow' | 'lightyellow' | 'darkyellow' | 'orange' | 'lightorange' | 'darkorange'
	| 'purple' | 'lightpurple' | 'darkpurple' | 'magenta' | 'lightmagenta' | 'darkmagenta'
	| 'aqua' | 'fuchsia' | 'gray' | 'lime' | 'maroon' | 'navy' | 'olive' | 'purple'
	| 'silver' | 'teal' | 'yellow' | 'aliceblue' | 'antiquewhite' | 'aqua' | 'aquamarine'
	| 'azure' | 'beige' | 'bisque' | 'blanchedalmond' | 'blueviolet' | 'brown'
	| 'burlywood' | 'cadetblue' | 'chartreuse' | 'chocolate' | 'coral' | 'cornflowerblue'
	| 'cornsilk' | 'crimson' | 'cyan' | 'darkblue' | 'darkcyan' | 'darkgoldenrod'
	| 'darkgray' | 'darkgreen' | 'darkkhaki' | 'darkmagenta' | 'darkolivegreen'
	| 'darkorange' | 'darkorchid' | 'darkred' | 'darksalmon' | 'darkseagreen'
	| 'darkslateblue' | 'darkslategray' | 'darkturquoise' | 'darkviolet'
	| 'deeppink' | 'deepskyblue' | 'dimgray' | 'dodgerblue' | 'firebrick' | 'floralwhite'
	| 'forestgreen' | 'gainsboro' | 'ghostwhite' | 'gold' | 'goldenrod' | 'gray'
	| 'greenyellow' | 'honeydew' | 'hotpink' | 'indianred' | 'indigo' | 'ivory'
	| 'khaki' | 'lavender' | 'lavenderblush' | 'lawngreen' | 'lemonchiffon'
	| 'lightblue' | 'lightcoral' | 'lightcyan' | 'lightgoldenrodyellow'
	| 'lightgray' | 'lightgreen' | 'lightpink' | 'lightsalmon' | 'lightseagreen'
	| 'lightskyblue' | 'lightslategray' | 'lightsteelblue' | 'lightyellow'
	| 'limegreen' | 'linen' | 'magenta' | 'mediumaquamarine' | 'mediumblue'
	| 'mediumorchid' | 'mediumpurple' | 'mediumseagreen' | 'mediumslateblue'
	| 'mediumspringgreen' | 'mediumturquoise' | 'mediumvioletred'
	| 'midnightblue' | 'mintcream' | 'mistyrose' | 'moccasin' | 'navajowhite'
	| 'oldlace' | 'olivedrab' | 'orange' | 'orangered' | 'orchid' | 'palegoldenrod'
	| 'palegreen' | 'paleturquoise' | 'palevioletred' | 'papayawhip'
	| 'peachpuff' | 'peru' | 'pink' | 'plum' | 'powderblue' | 'purple'
	| 'rebeccapurple' | 'rosybrown' | 'royalblue' | 'saddlebrown' | 'salmon'
	| 'sandybrown' | 'seagreen' | 'seashell' | 'sienna' | 'silver' | 'skyblue'
	| 'slateblue' | 'slategray' | 'snow' | 'springgreen' | 'steelblue'
	| 'tan' | 'thistle' | 'tomato' | 'turquoise' | 'violet' | 'wheat'
	| 'whitesmoke' | 'yellowgreen' | 'transparent' | 'unset';

/**
 * Represents color formats in different notations.
 * - HexColor: A hex color code starting with '#' followed by string characters.
 * - RGBColor: A color defined using the RGB model with integer values for red, green, and blue components.
 * - RGBAColor: An RGB color with an additional alpha component for transparency.
 */
type HexColor = `#${string}`;
type RGBColor = `rgb(${number}, ${number}, ${number})`;
type RGBAColor = `rgba(${number}, ${number}, ${number}, ${number})`;

/**
 * Union type for various color formats.
 * This allows colors to be represented as:
 * - Named colors (from the Colors type)
 * - Hexadecimal values
 * - RGB values
 * - RGBA values
 */
type Color = Colors | HexColor | RGBColor | RGBAColor;

export default Color;
