import beautifyCode from './Format';

/**
 * Interface representing the options for transforming files.
 * 
 * These options determine if IDs, unique IDs, and object names are added to the
 * QML elements.
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

/**
 * Anchor settings commonly used in QML layouts.
 */
const anchors = {
	fill: 'anchors.fill: parent',
	top: 'anchors.top: parent.top',
	left: 'anchors.left: parent.left',
	right: 'anchors.right: parent.right',
	bottom: 'anchors.bottom: parent.bottom',
	verticalCenter: 'anchors.verticalCenter: parent.verticalCenter',
	horizontalCenter: 'anchors.horizontalCenter: parent.horizontalCenter',
};

/**
 * Class responsible for transforming QML files based on the provided metadata.
 * It processes artboards, converts them into QML code, and handles ID generation, alignment, and anchor formatting.
 */
class QmlTransformer {
	private options: TransformationOptions;
	private idBucket: { [key: string]: number };
	public fontBucket: Set<string>;
	private importedLibraries: Set<string>;
	private qmlCode: string;
	private qmlFiles: { [key: string]: string };

	/**
	 * Constructor that initializes the transformer with user options and sets default values for properties.
	 * 
	 * @param options - TransformationOptions provided by the user.
	 */
	constructor(options: TransformationOptions) {
		this.options = options;
		this.idBucket = {};
		this.fontBucket = new Set();
		this.importedLibraries = new Set();
		this.qmlCode = '';
		this.qmlFiles = {};
	}

	/**
	 * Starts the transformation process for the provided metadata.
	 * It processes individual artboards and artboard sets, then updates and saves the generated QML.
	 * 
	 * @param metadata - The metadata containing information about the artboards and document.
	 */
	async startTransformation(metadata: any): Promise<{ [key: string]: any }> {
		// Process individual artboards
		metadata.artboards.forEach((artboard: any) => {
			this.parseItem(artboard);
		});

		// Save QML for the document
		this.updateAndSaveQml(metadata.documentInfo.name.replace(' ', ''));

		const artboardSets = metadata.artboardSets;

		// Process artboard sets
		artboardSets.forEach((artboardSet: any) => {
			this.qmlCode = ''; // Reset QML code for each artboard set

			// Process each artboard in the set
			artboardSet.artboards.forEach((artboard: any) => {
				this.parseItem(artboard);
			});

			// Save QML for the artboard set
			this.updateAndSaveQml(artboardSet.name.replace(' ', ''));
		});

		// return the qmlFiles
		return this.qmlFiles;
	}

	/**
	 * Updates the generated QML by adding library imports and performing cleanup.
	 * It then saves the QML code to local storage using the given filename.
	 * 
	 * @param fileName - The name under which the QML code will be saved.
	 */
	private updateAndSaveQml(fileName: string) {
		// Clean up the QML code (e.g., remove 'QtQuick.' prefix and simplify ENUM definitions)
		this.qmlCode = this.qmlCode
			.replace(/QtQuick\./g, '')
			.replace(/ENUM\((.*?)\)/g, '$1');

		// Prepend library imports to the QML code
		this.qmlCode = `${this.generateLibraryList()}\n${this.qmlCode}`;

		// Beautify the QML code and store it in the qmlFiles variable
		this.qmlFiles[fileName] = beautifyCode(this.qmlCode);
	}

	/**
	 * Generates the list of QML libraries to import by joining all imported libraries into a string.
	 * 
	 * @returns A string of QML import statements.
	 */
	private generateLibraryList(): string {
		return Array.from(this.importedLibraries)
			.map((library: string) => library)
			.join('\n');
	}

	/**
	 * Generates a unique ID for the item by keeping track of occurrences of IDs in a bucket.
	 * 
	 * @param id - The original ID for the item.
	 * @returns A unique ID based on the original.
	 */
	private generateUniqueId(id: string) {
		const key = `${id.charAt(0).toLowerCase()}${id.slice(1)}`;
		const count = this.idBucket[key] ?? 0;
		this.idBucket[key] = count + 1;
		return `${key}${count}`;
	}

	/**
	 * Resolves the alignment based on the provided side and type (vertical/horizontal).
	 * 
	 * @param side - The alignment side (top, left, right, bottom, justify, center).
	 * @param alignmentType - Specifies whether the alignment is vertical or horizontal.
	 * @returns The corresponding alignment string for QML.
	 */
	private resolveAlignment(
		side: 'top' | 'left' | 'right' | 'bottom' | 'justify' | 'center',
		alignmentType: 'vertical' | 'horizontal',
	): string {
		return side === 'center'
			? alignment.centerAlignment[alignmentType]
			: alignment.sideAlignment[side];
	}

	/**
	 * Formats the provided anchor settings into QML anchor properties.
	 * 
	 * @param anchorNames - An array of anchor names (keys from the anchors object).
	 * @returns A string of formatted anchor settings.
	 */
	private formatAnchorSettings(
		anchorNames: Array<keyof typeof anchors>
	): string {
		return anchorNames.map(name => anchors[name]).join('\n');
	}

	/**
	 * Parses individual items from the metadata, generating corresponding QML code for each item.
	 * 
	 * @param item - The metadata of the item to parse.
	 */
	private parseItem(item: any) {
		const metadata = item.metadata;

		// Add any extra imports needed for this item
		if (metadata.extraImports != null) {
			metadata.extraImports.forEach(
				(library: string) => this.importedLibraries.add(library)
			);
		}

		// Determine the item type
		let itemType = '';

		if (metadata.typeName != null) {
			if (metadata.typeName != 'SvgPathItem') {
				itemType = metadata.typeName;
			} else {
				itemType = 'Shape';
			}
		} else if (metadata.assetData != null) {
			itemType = 'Image';
		} else if (metadata.textDetails != null) {
			itemType = 'Text';
		} else {
			itemType = 'Item';
		}

		this.qmlCode += `\n\n${itemType} {`;

		// Add unique ID if required by options
		if (this.options.addIDs) {
			this.qmlCode += `\nid: ${this.generateUniqueId(metadata.qmlId.replace(' ', ''))}`;
		} else if (this.options.addUniqueIDs) {
			this.qmlCode += `\nid: "${metadata.uuid}"`;
		}

		// Set position and layer index
		if (metadata.exportType === 'component') {
			this.qmlCode += `\nx: 0\ny: 0\nz: 0`;
		} else {
			this.qmlCode += `\nx: ${item.x}\ny: ${item.y}\nz: ${item.layerIndex}`;
		}

		// Set width and height for non-text items
		if (metadata.textDetails == null) {
			this.qmlCode += `\nwidth: ${item.width}\nheight: ${item.height}`;
		}

		// Add object name if required by options
		if (this.options.addObjectNames) {
			this.qmlCode += `\nobjectName: "${item.name}"`;
		}

		// Handle various types of items and their properties (QML properties, SVG path, etc.)
		if (metadata.typeName != null) {
			if (metadata.typeName != 'SvgPathItem') {
				if (metadata.qmlProperties != null) {
					metadata.qmlProperties.forEach((qmlProperty: string) => {
						this.qmlCode += `\n${qmlProperty}`;
					});
				}
			} else {
				this.qmlCode += '\nShapePath {';
				if (metadata.qmlProperties != null) {
					metadata.qmlProperties.forEach((qmlProperty: { [key: string]: string }) => {
						if (qmlProperty.path == null) {
							this.qmlCode += `\n${qmlProperty}`;
						}
					});
				}
				this.qmlCode += `\nPathSvg {\n${metadata.qmlProperties[0]}\n}\n}`;
			}
		} else {
			if (metadata.qmlProperties != null) {
				metadata.qmlProperties.forEach((qmlProperty: string) => {
					this.qmlCode += `\n${qmlProperty}`;
				});
			}
		}

		// Set visibility and opacity if applicable
		if (metadata.qmlVisible != null) {
			this.qmlCode += `\nvisible: ${metadata.qmlVisible}`;
		}
		if (metadata.opacity != null) {
			this.qmlCode += `\nopacity: ${metadata.opacity}`;
		}

		// Format and apply anchors if provided
		if (metadata.anchors != null) {
			this.qmlCode += `\n${this.formatAnchorSettings(metadata.anchors)}`;
		}

		// Set text properties if this is a text item
		if (metadata.textDetails != null) {
			const textDetails = metadata.textDetails;

			this.qmlCode += `\ntext: "${textDetails.contents}"`;
			this.qmlCode += `\ncolor: "${textDetails.textColor.toLowerCase()}"`;
			this.qmlCode += `\nfont.family: "${textDetails.fontFamily}"`;
			this.qmlCode += `\nfont.styleName: "${textDetails.fontDisplayName}"`;
			this.qmlCode += `\nfont.pixelSize: ${textDetails.fontSize}`;

			// Set line height and alignment for text
			if (textDetails.lineHeight != null) {
				this.qmlCode += `\nlineHeight: ${textDetails.lineHeight}`;
				this.qmlCode += '\nlineHeightMode: Text.FixedHeight';
			}

			this.qmlCode += `\nverticalAlignment: ${this.resolveAlignment(textDetails.verticalAlignment, 'vertical')}`;
			this.qmlCode += `\nhorizontalAlignment: ${this.resolveAlignment(textDetails.horizontalAlignment, 'horizontal')}`;

			// Add font family to the bucket for future use
			this.fontBucket.add(textDetails.fontFamily.toString());
		}

		// Apply transformation (rotation, scale, etc.)
		if (metadata.transformation != null) {
			const transformation = metadata.transformation;

			this.qmlCode += `\nrotation: ${transformation.rotation}`;

			if (transformation.flippedVertically || transformation.flippedHorizontally) {
				if (transformation.flippedHorizontally) {
					this.qmlCode += '\nxScale: -1';
				} else {
					this.qmlCode += '\nyScale: -1';
				}

				// Set the origin for transformation
				this.qmlCode += '\norigin.x: parent.width/2';
				this.qmlCode += '\norigin.y: parent.height/2';
			}
		}

		// Set the source for image assets
		if (metadata.assetData != null) {
			this.qmlCode += `\nsource: "./Images/${metadata.assetData.assetPath.split('/').pop()}"`;
		}

		// Recursively parse child items
		if (item.children != null) {
			item.children.forEach((item: any) => {
				this.parseItem(item);
			});
		}

		// Close the item block
		this.qmlCode += '\n}';
	}
}

export default QmlTransformer;
