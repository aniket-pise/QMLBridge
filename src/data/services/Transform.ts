import beautifyCode from './Format';

/**
 * Interface representing the options for transforming files.
 * 
 * These options determine if IDs, unique IDs, and object names are added to the
 * QML elements, and whether fonts should be downloaded during processing.
 */
export interface TransformationOptions {
	addIDs: boolean;
	addUniqueIDs: boolean;
	addObjectNames: boolean;
	downloadFonts: boolean;
}

/**
 * Represents the valid keys of the TransformationOptions interface.
 * 
 * This type is used to ensure only recognized option keys are used
 * when accessing checkbox states or handling option changes.
 */
export type TransformationOptionKey = keyof TransformationOptions;

/**
 * Alignment settings for both center and side alignment options in QML.
 * 
 * This object provides standardized alignment constants used throughout
 * QML transformation to ensure consistent formatting of text and layout elements.
 */
const alignment = {
	centerAlignment: {
		vertical: 'Qt.AlignVCenter',
		horizontal: 'Qt.AlignHCenter',
	},
	sideAlignment: {
		top: 'Qt.AlignTop',
		left: 'Qt.AlignLeft',
		right: 'Qt.AlignRight',
		bottom: 'Qt.AlignBottom',
		justify: 'Qt.AlignJustify',
		baseline: 'Qt.AlignBaseline',
	},
};

// /**
//  * Anchor settings commonly used in QML layouts.
//  */
// const anchors = {
// 	fill: 'anchors.fill: parent',
// 	top: 'anchors.top: parent.top',
// 	left: 'anchors.left: parent.left',
// 	right: 'anchors.right: parent.right',
// 	bottom: 'anchors.bottom: parent.bottom',
// 	verticalCenter: 'anchors.verticalCenter: parent.verticalCenter',
// 	horizontalCenter: 'anchors.horizontalCenter: parent.horizontalCenter',
// };

/**
 * Type representing a single QML file as a string of formatted QML code.
 * 
 * This type is used for leaf nodes in the QML directory structure where
 * the value contains the actual QML source code.
 */
export type QmlFile = string;

/**
 * Type representing a directory structure of QML files.
 * 
 * This recursive type allows for nested organization of QML files,
 * where keys represent directory or component names and values can be
 * either QML code strings or further nested directory structures.
 */
export type QmlDirectory = { [key: string]: QmlValue };

/**
 * Union type representing any value within a QML directory structure.
 * 
 * This type can be either a QML code string or a nested directory object,
 * enabling flexible hierarchical organization of generated QML content.
 */
export type QmlValue = QmlFile | QmlDirectory;

/**
 * Class responsible for transforming design metadata into structured QML code.
 * 
 * This transformer processes artboards and design elements, converting them
 * into properly formatted QML files with support for IDs, alignment,
 * typography, and hierarchical organization.
 */
class QmlTransformer {
	/** User-provided transformation options controlling QML generation behavior */
	private options: TransformationOptions;

	/** Collection of font families referenced in text elements for optional downloading */
	public fontBucket: Set<string>;

	/** Set of imported QML libraries required for the generated code */
	private importedLibraries: Set<string>;

	/** Buffer for accumulating QML code during the transformation of individual items */
	private qmlCode: string;

	/** Hierarchical structure containing all generated QML files organized by component */
	private qmlFiles: QmlDirectory;

	/** Current depth in the file path hierarchy used for resolving relative asset paths */
	private currentPathDepth: number;

	/**
	 * Initializes a new QmlTransformer with the specified user options.
	 * 
	 * @param options - Configuration options controlling QML generation behavior
	 */
	constructor(options: TransformationOptions) {
		this.options = options;
		this.fontBucket = new Set();
		this.importedLibraries = new Set();
		this.qmlCode = '';
		this.qmlFiles = {};
		this.currentPathDepth = 0;
	}

	/**
	 * Initiates the transformation of design metadata into structured QML files.
	 * 
	 * This method orchestrates the complete transformation pipeline:
	 * 1. Processes individual artboards into root QML components
	 * 2. Processes artboard sets into reusable QML components
	 * 3. Organizes all generated QML into a hierarchical directory structure
	 * 
	 * @param metadata - Complete design metadata containing artboards, artboard sets,
	 *                   and document information
	 * @returns Promise that resolves with the hierarchical QML directory structure
	 */
	async startTransformation(metadata: any): Promise<{ [key: string]: any }> {
		// Process main artboards into the root directory of QML files
		this.qmlFiles[this.removeNonAlphanumeric('Root')] = this.processArtboards(metadata.artboards);

		// Container for reusable components extracted from artboard sets
		const components: { [key: string]: { [key: string]: string } } = {};

		// Registry for tracking and deduplicating component names across artboard sets
		const nameCount: { [key: string]: number } = {};

		// Process each artboard set into separate reusable QML components
		metadata.artboardSets.forEach((artboardSet: any) => {
			// Normalize artboard set name by removing non-alphanumeric characters
			let artboardSetName = this.removeNonAlphanumeric(artboardSet.name);

			// Handle duplicate component names by appending numerical suffixes
			nameCount[artboardSetName] ? artboardSetName = `${artboardSetName}${nameCount[artboardSetName]++}` : nameCount[artboardSetName] = 1;

			// Process artboards within this set and store as a reusable component
			components[artboardSetName] = this.processArtboards(artboardSet.artboards, 1);
		});

		// Store all reusable components in a dedicated directory structure
		this.qmlFiles[this.removeNonAlphanumeric('Components')] = components;

		// Return the complete hierarchical QML directory structure
		return this.qmlFiles;
	}

	/**
	 * Removes all non-alphanumeric characters from a string to create valid QML identifiers.
	 * 
	 * This sanitization ensures that generated IDs, object names, and file names
	 * comply with QML naming conventions and avoid syntax errors. The function:
	 * 1. Removes any non-alphanumeric characters.
	 * 2. Ensures the string starts with an alphabetic character.
	 * 3. Moves any numeric characters at the beginning of the string to the end.
	 * 
	 * @param value - The original string to sanitize.
	 * @returns Sanitized string containing only alphanumeric characters, following QML naming conventions.
	 */
	private removeNonAlphanumeric = (value: string) => {
		// Remove non-alphanumeric characters
		value = value.replace(/[^a-zA-Z0-9]/g, '');

		// Check if the string has no alphabet characters
		if (!/[a-zA-Z]/.test(value)) {
			// If no alphabet is found, prepend 'a' to the string to ensure it starts with a letter
			value = 'a' + value.slice(1);
		}

		// Check if the value starts with numbers
		if (value[0] && !isNaN(Number(value[0]))) {
			// Move leading numbers to the end
			let numericPart = '';

			// Iterate over the string and accumulate the leading digits
			let i = 0;
			while (i < value.length && !isNaN(Number(value[i]))) {
				numericPart += value[i++];
			}

			// Append the numeric part to the end of the string
			value = value.slice(i) + numericPart;
		}

		// Return the sanitized value
		return value;
	};

	/**
	 * Processes a collection of artboards into individual QML files.
	 * 
	 * This method transforms each artboard in the collection into a standalone
	 * QML component, handling name deduplication and proper code formatting.
	 * 
	 * @param artboards - Array of artboard metadata objects to transform
	 * @param pathDepth - Current depth in the directory hierarchy for relative path resolution
	 * @returns Object mapping sanitized artboard names to their corresponding QML code
	 */
	private processArtboards(artboards: any, pathDepth: number = 0): { [key: string]: string } {
		// Update current path depth for relative asset path calculations
		this.currentPathDepth = pathDepth;

		// Container for generated QML components keyed by sanitized names
		const components: { [key: string]: string } = {};

		// Registry for tracking and resolving duplicate artboard names
		const nameCount: { [key: string]: number } = {};

		// Transform each artboard into a QML component
		artboards.forEach((artboard: any) => {
			// Reset imported libraries for each new artboard
			this.importedLibraries.clear();

			// Add default QtQuick import required for all QML files
			this.importedLibraries.add('import QtQuick');

			// Clear QML code buffer for new artboard processing
			this.qmlCode = '';

			// Recursively parse the artboard and its child elements
			this.parseItem(artboard);

			// Clean up any remaining ENUM() placeholders in the generated code
			this.qmlCode = this.qmlCode.replace(/ENUM\((.*?)\)/g, '$1');

			// Sanitize artboard name for use as a valid identifier
			let artboardName = this.removeNonAlphanumeric(artboard.name);

			// Handle duplicate names by appending numerical suffixes
			nameCount[artboardName] ? artboardName = `${artboardName}${nameCount[artboardName]++}` : nameCount[artboardName] = 1;

			// Combine imports with generated code and apply formatting
			components[artboardName] = beautifyCode(
				`${Array.from(this.importedLibraries).join('\n')}\n${this.qmlCode}`
			);
		});

		// Return all generated QML components for this artboard collection
		return components;
	}

	/**
	 * Determines the appropriate QML object type based on metadata properties.
	 * 
	 * This method analyzes metadata to identify whether an element should be
	 * represented as an Image, Text, or generic Item in the generated QML.
	 * 
	 * @param metadata - Element metadata containing type information and properties
	 * @returns String representing the QML object type (Image, Text, or Item)
	 */
	private determineObjectType(metadata: any): string {
		// Use explicit type name from metadata when available
		if (metadata.typeName) {
			return metadata.typeName.split('.').at(-1);
		} else {
			// Determine type based on available property sets
			if (metadata.assetData) return 'Image';
			if (metadata.textDetails) return 'Text';
			return 'Item';
		}
	}

	/**
	 * Resolves alignment values to their corresponding QML alignment constants.
	 * 
	 * This method converts design alignment specifications into QML-compatible
	 * alignment constants, supporting both center and side alignment options.
	 * 
	 * @param side - The alignment side (top, left, right, bottom, justify, or center)
	 * @param alignmentType - Specifies whether the alignment is vertical or horizontal
	 * @returns QML alignment constant string for use in text or layout properties
	 */
	private resolveAlignment(
		side: 'top' | 'left' | 'right' | 'bottom' | 'justify' | 'center',
		alignmentType: 'vertical' | 'horizontal',
	): string {
		// Return center alignment for 'center' side, otherwise side-specific alignment
		return side === 'center'
			? alignment.centerAlignment[alignmentType]
			: alignment.sideAlignment[side];
	}

	// /**
	//  * Formats the provided anchor settings into QML anchor properties.
	//  * 
	//  * @param anchorNames - An array of anchor names (keys from the anchors object).
	//  * @returns A string of formatted anchor settings.
	//  */
	// private formatAnchorSettings(
	// 	anchorNames: Array<keyof typeof anchors>
	// ): string {
	// 	return anchorNames.map(name => anchors[name]).join('\n');
	// }

	/**
	 * Recursively parses a design element and generates corresponding QML code.
	 * 
	 * This core transformation method processes individual design elements,
	 * handling properties, child elements, text formatting, images, and
	 * transformations to produce complete QML representations.
	 * 
	 * @param item - Design element metadata containing properties and child hierarchy
	 */
	private parseItem(item: any) {
		// Extract metadata object containing QML-specific properties
		const metadata = item.metadata;

		// Add any extra QML imports required for this specific element
		if (metadata.extraImports) {
			metadata.extraImports.forEach(
				(library: string) => this.importedLibraries.add(library)
			);
		}

		// Begin QML object declaration based on determined type
		this.qmlCode += `\n\n${this.determineObjectType(metadata)} {`;

		// Determine which ID to use based on user options and available metadata
		const idToUse = (this.options.addIDs && metadata.qmlId) || (this.options.addUniqueIDs && metadata.uuid);

		// Add ID property if configured and available
		if (idToUse) this.qmlCode += `\nid: ${this.removeNonAlphanumeric(idToUse)}`;

		// Add objectName property if configured by user options
		if (this.options.addObjectNames) this.qmlCode += `\nobjectName: "${this.removeNonAlphanumeric(item.name)}"`;

		// Add basic geometric properties if present in the element
		if (item.x) this.qmlCode += `\nx: ${item.x}`;
		if (item.y) this.qmlCode += `\ny: ${item.y}`;
		if (item.layerIndex) this.qmlCode += `\nz: ${item.layerIndex}`;
		if (item.width) this.qmlCode += `\nwidth: ${item.width}`;
		if (item.height) this.qmlCode += `\nheight: ${item.height}`;

		// Add any custom QML properties defined in metadata
		if (metadata.qmlProperties && metadata.qmlProperties.length) {
			this.qmlCode += `\n${metadata.qmlProperties.join('\n')}`;
		}

		// Add visual properties if specified in metadata
		if (metadata.clip) this.qmlCode += `\nclip: ${metadata.clip}`;
		if (metadata.opacity) this.qmlCode += `\nopacity: ${metadata.opacity}`;
		if (metadata.qmlVisible) this.qmlCode += `\nvisible: ${metadata.qmlVisible}`;

		// // Format and apply anchors if provided
		// if (metadata.anchors != null) {
		// 	this.qmlCode += `\n${this.formatAnchorSettings(metadata.anchors)}`;
		// }

		// Process text-specific properties if this element contains text
		if (metadata.textDetails) {
			const textDetails = metadata.textDetails;

			// Add core text properties
			this.qmlCode += `\ntext: "${textDetails.contents}"`;
			this.qmlCode += `\ncolor: "${textDetails.textColor}"`;
			this.qmlCode += `\nfont.family: "${textDetails.fontFamily}"`;
			this.qmlCode += `\nfont.styleName: "${textDetails.fontDisplayName}"`;
			this.qmlCode += `\nfont.pixelSize: ${textDetails.fontSize}`;
			this.qmlCode += `\nfont.features: { "kern": ${textDetails.kerning} }`;
			this.qmlCode += `\nverticalAlignment: ${this.resolveAlignment(textDetails.verticalAlignment, 'vertical')}`;
			this.qmlCode += `\nhorizontalAlignment: ${this.resolveAlignment(textDetails.horizontalAlignment, 'horizontal')}`;

			// Add line height properties if specified
			if (textDetails.lineHeight) {
				this.qmlCode += `\nlineHeight: ${textDetails.lineHeight}`;
				this.qmlCode += '\nlineHeightMode: Text.FixedHeight';
			}

			// Add font family to the bucket for future use
			this.fontBucket.add(textDetails.fontFamily.toString());
		}

		// Apply transformation properties (rotation, scale, flipping)
		if (metadata.transformation) {
			const transformation = metadata.transformation, transforms: string[] = [];

			// Add rotation transformation if specified
			if (transformation.rotation) {
				transforms.push(
					'\nRotation {' +
					`\nangle: ${transformation.rotation}` +
					'\norigin.x: parent.width / 2' +
					'\norigin.y: parent.height / 2' +
					'\n}'
				);
			}

			// Add scale transformation for vertical or horizontal flipping
			if (transformation.flippedVertically || transformation.flippedHorizontally) {
				let scaleProps = '\nScale {';

				scaleProps += (transformation.flippedHorizontally ? '\nxScale: -1' : '');
				scaleProps += (transformation.flippedVertically ? '\nyScale: -1' : '');
				scaleProps += '\norigin.x: parent.width / 2';
				scaleProps += '\norigin.y: parent.height / 2';
				scaleProps += '\n}';

				transforms.push(scaleProps);
			}

			// Add transform property if any transformations were applied
			if (transforms.length) this.qmlCode += `\ntransform: [\n${transforms.join(',\n')}\n]`;
		}

		// Process image source property for Image elements
		if (metadata.assetData) {
			// Extract filename from full asset path
			const assetFileName = metadata.assetData.assetPath.split('/').at(-1);

			// Build relative path to image file accounting for directory depth
			this.qmlCode += `\nsource: "${'../'.repeat(this.currentPathDepth + 1)}Images/${assetFileName}"`;
		}

		// Recursively parse child elements to maintain hierarchical structure
		if (item.children != null) {
			item.children.forEach((item: any) => {
				this.parseItem(item);
			});
		}

		// Close the QML object declaration
		this.qmlCode += '\n}';
	}
}

export default QmlTransformer;
