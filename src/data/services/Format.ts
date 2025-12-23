/**
 * Beautifies the given code by adding proper indentation to nested blocks.
 * 
 * @param {string} code - The code to be formatted.
 * @returns {Promise<string>} - The formatted code as a string.
 */
function beautifyCode(code: string): string {
	// To keep track of the current level of indentation
	let indentLevel = 0;

	// Four spaces used for indentation
	const indentString = '\t';

	// Split the code into lines for processing
	const lines = code.split('\n');

	// Format each line by adjusting indentation based on braces
	const formattedLines = lines.map(line => {
		// Trim any leading or trailing whitespace from the line
		line = line.trim();

		// Decrease indent level if the line starts with a closing brace
		if (line.startsWith('}')) {
			// Reduce indentation level
			indentLevel--;

			// Add the correct indent
			return indentString.repeat(indentLevel) + line;
		}

		// If the line ends with an opening brace, format the line and increase the indent level
		if (line.endsWith('{')) {
			// Add the correct indent
			const formattedLine = indentString.repeat(indentLevel) + line;

			// Increase the indentation level for following lines
			indentLevel++;

			// Return formatted line
			return formattedLine;
		}

		// Format lines that don't contain braces with the current indentation level
		return indentString.repeat(indentLevel) + line;
	});

	// Join the formatted lines into a single string and trim extra whitespace
	const formattedCode = formattedLines.join('\n').trim();

	// Return the fully formatted code as a Promise
	return formattedCode;
}

export default beautifyCode;
