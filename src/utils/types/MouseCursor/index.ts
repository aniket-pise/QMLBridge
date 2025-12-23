/**
 * Defines possible mouse cursor styles for user interactions.
 */
type MouseCursor =
	| 'auto' | 'none' | 'default' | 'context-menu' | 'help'
	| 'pointer' | 'progress' | 'wait' | 'cell' | 'crosshair' | 'text'
	| 'vertical-text' | 'alias' | 'copy' | 'move' | 'no-drop'
	| 'not-allowed' | 'grab' | 'grabbing'
	| 'e-resize' | 'n-resize' | 'ne-resize' | 'nw-resize'
	| 's-resize' | 'se-resize' | 'sw-resize' | 'w-resize'
	| 'ew-resize' | 'ns-resize' | 'nesw-resize' | 'nwse-resize'
	| 'col-resize' | 'row-resize' | 'all-scroll' | 'zoom-in' | 'zoom-out';

export default MouseCursor;
