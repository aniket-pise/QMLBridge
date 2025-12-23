import { FC } from 'react';
import { ColorsPalette } from '../../../utils/constants/colors';
import { useTheme } from '../../../utils/theme';

/**
 * LogBox component that displays logs in a styled box
 * @param logs - Optional array of log messages to display
 */
const LogBox: FC<{ logs?: string[] }> = ({ logs }) => {
	// Retrieves the theme colors and current theme using the `useTheme` hook
	const { theme, colors } = useTheme();

	// Determines if the current theme is dark mode by checking if theme equals 'dark'
	const isDarkMode = theme === 'dark';

	// Function to determine the margin for each log message based on its index
	const getMargin = (index: number) => {
		// No margin-top for the first log
		if (index === 0) return '0 0 8px 0';

		// Margin-top for the last log
		if (index === logs!.length - 1) return '8px 0 0 0';

		// Default margin for other logs
		return '8px 0';
	};

	// Render the log box component
	return (
		<div
			role='log'
			aria-label='Log output'
			style={{
				width: '100%',
				overflow: 'hidden',
				userSelect: 'none',
				borderRadius: '16px',
				border: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
				boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
				background: isDarkMode ? colors.Solid300 : colors.Solid100,
			}}>
			{/* Header container for title and action buttons */}
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '18px 20px',
				borderRadius: '16px 16px 0 0',
				borderBottom: `1px solid ${isDarkMode ? colors.Solid500 : colors.Solid300}`,
				background: `linear-gradient(90deg, ${isDarkMode ? colors.Solid300 : colors.Solid100} 0%, ${colors.Solid200} 100%)`,
			}}>
				{/* Terminal icon and log title */}
				<h3 style={{
					gap: '14px',
					margin: 0,
					fontWeight: 600,
					display: 'flex',
					alignItems: 'center',
				}}>
					{/* Terminal icon */}
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke={isDarkMode ? ColorsPalette.Lime600 : ColorsPalette.Lime400}
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'>
						<polyline points='4 17 10 11 4 5' />
						<line x1='12' y1='19' x2='20' y2='19' />
					</svg>

					{/* Log title */}
					<p style={{
						margin: 0,
						fontSize: '14px',
						color: isDarkMode ? colors.Solid900 : colors.Solid600,
						fontWeight: '600',
					}}>Activity Logs</p>
				</h3>

				{/* Container for action buttons */}
				<div style={{
					display: 'grid',
					columnGap: 10,
					gridTemplateColumns: 'repeat(3, 1fr)',
				}}>
					{/* Green action button */}
					<div
						style={{
							padding: 8,
							borderRadius: '50%',
							cursor: 'pointer',
							transition: 'background-color 0.3s',
							backgroundColor: isDarkMode ? ColorsPalette.Green800 : ColorsPalette.Green300,
						}}
						onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? ColorsPalette.Green700 : ColorsPalette.Green400}
						onMouseLeave={e => e.currentTarget.style.backgroundColor = isDarkMode ? ColorsPalette.Green800 : ColorsPalette.Green300}
					/>

					{/* Yellow action button */}
					<div
						style={{
							padding: 8,
							borderRadius: '50%',
							cursor: 'pointer',
							transition: 'background-color 0.3s',
							backgroundColor: isDarkMode ? ColorsPalette.Yellow800 : ColorsPalette.Yellow300,
						}}
						onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? ColorsPalette.Yellow700 : ColorsPalette.Yellow400}
						onMouseLeave={e => e.currentTarget.style.backgroundColor = isDarkMode ? ColorsPalette.Yellow800 : ColorsPalette.Yellow300}
					/>

					{/* Red action button */}
					<div
						style={{
							padding: 8,
							borderRadius: '50%',
							cursor: 'pointer',
							transition: 'background-color 0.3s',
							backgroundColor: isDarkMode ? ColorsPalette.Red800 : ColorsPalette.Red300,
						}}
						onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? ColorsPalette.Red700 : ColorsPalette.Red400}
						onMouseLeave={e => e.currentTarget.style.backgroundColor = isDarkMode ? ColorsPalette.Red800 : ColorsPalette.Red300}
					/>
				</div>
			</div>

			{/* Body container for logs */}
			<div style={{
				height: 375,
				padding: 18,
				color: isDarkMode ? colors.Solid800 : colors.Solid600,
				overflowY: 'auto',
				fontSize: '12.8px',
				fontFamily: 'monospace',
			}}>
				{/* Render log messages, if available */}
				{logs && logs.map((log, index) => (
					<p
						key={index}
						style={{
							margin: getMargin(index),
							whiteSpace: 'pre-wrap',
						}}>
						{/* Render each log message */}
						<span style={{
							color: isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400,
							marginRight: '6px',
						}}>$</span> {log}
					</p>
				))}
			</div>
		</div>
	);
};

export default LogBox;
