import { Alignment } from "../types";

/**
 * Determines the justify-content CSS property based on alignment.
 * 
 * @param alignment - The alignment type which can be 'h-center', 
 * 'top-left', 'bottom-left', 'top-right', 'bottom-right', 'center', or others.
 * 
 * @returns A string representing the justify-content value.
 */
export function justifyContent(alignment: Alignment): 'normal' | 'flex-start' | 'center' | 'flex-end' {
	const alignmentMap: Record<Alignment, 'normal' | 'flex-start' | 'center' | 'flex-end'> = {
		'top': 'center',
		'left': 'flex-start',
		'right': 'flex-end',
		'bottom': 'center',
		'normal': 'normal',
		'center': 'center',
		'top-left': 'flex-start',
		'top-right': 'flex-end',
		'bottom-left': 'flex-start',
		'bottom-right': 'flex-end',
	};

	return alignmentMap[alignment] || 'normal';
}

/**
 * Determines the align-items CSS property based on alignment.
 * 
 * @param alignment - The alignment type which can be 'v-center', 
 * 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center', or others.
 * 
 * @returns A string representing the align-items value.
 */
export function alignItems(alignment: Alignment): 'normal' | 'flex-start' | 'center' | 'flex-end' {
	const alignmentMap: Record<Alignment, 'normal' | 'flex-start' | 'center' | 'flex-end'> = {
		'top': 'flex-start',
		'left': 'center',
		'right': 'center',
		'bottom': 'flex-end',
		'normal': 'normal',
		'center': 'center',
		'top-left': 'flex-start',
		'top-right': 'flex-start',
		'bottom-left': 'flex-end',
		'bottom-right': 'flex-end',
	};

	return alignmentMap[alignment] || 'normal';
}
