import { SnackBarProps } from "../../../utils/types";
import { FC, useCallback, useEffect, useState } from "react";

/**
 * SnackBar component for displaying a temporary message with customizable
 * appearance and behavior.
 * 
 * @param {SnackBarProps} props - Customizable properties for the SnackBar
 */
const SnackBar: FC<SnackBarProps> = ({
	title,
	message,
	titleColor = '#44546F',
	messageColor = '#44546F',
	closeIcon,
	closeIconColor = '#44546F',
	elevation = '15px',
	shadowColor = '#EDEEF0',
	borderRadius = '12px',
	backgroundColor = 'white',
	barrierColor = '#00000012',
	barrierDismissible = false,
	width = 'auto',
	margin = '15px',
	padding = '15px',
	duration = '3000',
	appearTime = '300ms',
	dismissTime = '300ms',
	animation = 'fade',
	animationTimingFunction = 'ease-out',
	dismissDirection = 'right',
	location = 'bottomRight',
	onClose,
}) => {
	// State variables to manage visibility, dismissal, and mounting of the SnackBar
	const [isVisible, setIsVisible] = useState(false);
	const [isDismissing, setIsDismissing] = useState(false);
	const [isMounted, setIsMounted] = useState(true);

	// Function to handle the dismissal of the SnackBar
	const handleDismiss = useCallback(() => {
		// Set the dismissing state to trigger the dismissal animation
		setIsDismissing(true);
		// After the dismissal animation time, hide the SnackBar and trigger onClose callback
		setTimeout(() => {
			setIsVisible(false);
			// Unmount the component after a brief delay
			setTimeout(() => setIsMounted(false), 100);
			// Execute onClose callback if provided
			if (onClose) onClose();
		}, parseInt(dismissTime));
	}, [dismissTime, onClose]);

	// Manage SnackBar visibility with a timeout to automatically dismiss
	useEffect(() => {
		setIsVisible(true);
		// Set a timer to automatically dismiss the SnackBar after the specified duration
		const timer = setTimeout(() => {
			handleDismiss();
		}, parseInt(duration));

		// Clean up the timer when component unmounts or duration changes
		return () => clearTimeout(timer);
	}, [duration, handleDismiss]);

	// Handle barrier click for dismissing the SnackBar (if enabled)
	const handleBarrierClick = () => {
		// Only dismiss if barrierDismissible is true
		if (barrierDismissible) {
			handleDismiss();
		}
	};

	// Determine alignment styles based on the SnackBar's location on the screen
	const locationStyles = (): React.CSSProperties => {
		switch (location) {
			case 'top':
				return { justifyContent: 'center', alignItems: 'flex-start' };
			case 'bottom':
				return { justifyContent: 'center', alignItems: 'flex-end' };
			case 'left':
				return { justifyContent: 'flex-start', alignItems: 'center' };
			case 'right':
				return { justifyContent: 'flex-end', alignItems: 'center' };
			case 'topLeft':
				return { justifyContent: 'flex-start', alignItems: 'flex-start' };
			case 'topRight':
				return { justifyContent: 'flex-end', alignItems: 'flex-start' };
			case 'bottomLeft':
				return { justifyContent: 'flex-start', alignItems: 'flex-end' };
			case 'bottomRight':
				return { justifyContent: 'flex-end', alignItems: 'flex-end' };
			default:
				return { justifyContent: 'center', alignItems: 'center' };
		}
	};

	// Define the dismissal animation based on the specified direction
	const dismissAnimation = (): string => {
		switch (dismissDirection) {
			case 'left':
				return 'translateX(-100%)';
			case 'right':
				return 'translateX(100%)';
			case 'up':
				return 'translateY(-100%)';
			case 'down':
				return 'translateY(100%)';
			default:
				return '';
		}
	};

	// Define the appearance animation based on the selected animation type
	const appearAnimation = (): string => {
		switch (animation) {
			case 'fade':
				return 'opacity 1';
			case 'slide':
				return 'translateY(0)';
			default:
				return 'opacity 1';
		}
	};

	// Combine transition styles for animation
	const animationStyles = (): React.CSSProperties => ({
		transition: `transform ${appearTime} ${animationTimingFunction}, opacity ${appearTime} ${animationTimingFunction}`,
		opacity: isVisible && !isDismissing ? 1 : 0,
		transform: isVisible && !isDismissing ? appearAnimation() : dismissAnimation(),
	});

	// Prevent rendering if the SnackBar is no longer mounted
	if (!isMounted) return null;

	// JSX rendering for the SnackBar component
	return (
		// The barrier div that covers the viewport and handles click-to-dismiss behavior
		<div
			style={{
				width: '100vw',
				height: '100vh',
				display: 'flex',
				userSelect: 'none',
				backgroundColor: barrierColor,
				...locationStyles(),
			}}
			onClick={handleBarrierClick}
		>
			{/* The actual SnackBar content container */}
			<div
				role='alert'
				aria-live='assertive'
				aria-atomic='true'
				style={{
					width: width,
					margin: margin,
					padding: padding,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					background: backgroundColor,
					borderRadius: borderRadius,
					boxShadow: `0 1px ${elevation} ${shadowColor}`,
					position: 'relative',
					...animationStyles(),
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Title and message section */}
				<div>
					{/* SnackBar Title */}
					<div style={{
						color: titleColor,
						fontSize: '16px',
						fontWeight: 'bold',
						marginBottom: '6px',
					}}>
						{title}
					</div>

					{/* SnackBar Message */}
					<div style={{
						color: messageColor,
						fontSize: '14px',
					}}>
						{message}
					</div>
				</div>

				{/* The close button to dismiss the SnackBar (optional) */}
				{closeIcon && (
					<div
						tabIndex={0}
						role='button'
						aria-label='Close'
						onClick={handleDismiss}
						style={{
							width: '24px',
							height: '24px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: closeIconColor,
							marginLeft: padding,
						}}
					>
						{closeIcon}
					</div>
				)}
			</div>
		</div>
	);
};

export default SnackBar;
