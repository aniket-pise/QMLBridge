import { useNavigate } from 'react-router-dom';
import { Page } from '../../common/components';
import { useTheme } from '../../utils/theme';
import { ColorsPalette } from '../../utils/constants/colors';
import { useEffect, useState } from 'react';
import { FilledButton, OutlinedButton } from '../../common/widgets';

/**
 * PageNotFound component displays a 404 error page when users navigate to a non-existent route.
 * It features a responsive layout with helpful navigation options and consistent styling.
 * 
 * This page:
 * - Displays a clear 404 error message with a friendly illustration
 * - Provides navigation options to return to useful pages
 * - Uses theme-aware colors and typography for consistent design
 * - Adapts layout based on window width for optimal viewing
 */
const PageNotFound: React.FC = () => {
  // Retrieves the theme colors and current theme using the `useTheme` hook
  const { theme, colors } = useTheme();

  // Determines if the current theme is dark mode by checking if theme equals 'dark'
  const isDarkMode = theme === 'dark';

  // State to track the current window width for dynamic layout adjustments
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // useEffect hook to update windowWidth when the window is resized
  useEffect(() => {
    // Event handler to update state with the current window width
    const handleResize = () => setWindowWidth(window.innerWidth);

    // Attach resize event listener to the window
    window.addEventListener('resize', handleResize);

    // Cleanup the event listener when the component is unmounted
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Breakpoint constants for responsive design
  const isMobile = windowWidth <= 599;

  // Hook for programmatic navigation
  const navigate = useNavigate();

  return (
    <Page
      windowWidth={window.innerWidth}
      children={(
        <main style={{
          flexGrow: 1,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: windowWidth > 599 ? 'auto' : 'unset',
          padding: windowWidth > 999 ? '40px 80px' : windowWidth > 599 ? '30px 40px' : '75px 25px',
        }}>
          {/* Error content section */}
          <section style={{ maxWidth: windowWidth > 1199 ? '40%' : windowWidth > 599 ? '55%' : '100%' }}>
            {/* Error Code Display */}
            <div style={{
              fontSize: '108px',
              fontWeight: '700',
              backgroundImage: `linear-gradient(45deg, ${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400}, ${isDarkMode ? ColorsPalette.Lime400 : ColorsPalette.Lime700})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.35,
              margin: 0,
              backgroundSize: '100%',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}>
              404
            </div>

            {/* Error Message */}
            <h1 style={{
              color: isDarkMode ? colors.Solid900 : colors.Solid800,
              margin: '16px 0',
              fontSize: '20px',
              fontWeight: '600',
            }}>
              Page Not Found
            </h1>

            {/* Error Description */}
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? colors.Solid800 : colors.Solid700,
              margin: 0,
            }}>
              The page you're looking for doesn't exist or has been moved.
              Check the URL or try navigating to one of our main pages below.
            </p>
          </section>

          {/* Navigation Buttons Container */}
          <section style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            margin: '48px 0',
          }}>
            {/* Home Button */}
            <FilledButton
              child={'Return to Home'}
              buttonStyle={{
                background: `linear-gradient(45deg, ${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400}, ${isDarkMode ? ColorsPalette.Lime400 : ColorsPalette.Lime700})`,
                borderSide: {
                  color: 'unset',
                  width: 0,
                  style: 'none',
                },
                padding: '12px 24px',
                transition: 'all 0.3s ease',
                boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
              }}
              textStyle={{
                color: colors.Solid100,
                fontSize: 14,
                fontWeight: 600,
              }}
              onPressed={() => navigate('/')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? ColorsPalette.Lime700 : ColorsPalette.Lime400}1A`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
                }
              }}
            />

            {/* Features Button */}
            <OutlinedButton
              child={'View Features'}
              buttonStyle={{
                padding: '12px 24px',
                transition: 'all 0.3s ease',
                boxShadow: `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`,
              }}
              textStyle={{
                color: isDarkMode ? ColorsPalette.Lime500 : ColorsPalette.Lime600,
                fontSize: 14,
                fontWeight: 600,
              }}
              onPressed={() => navigate('/features')}
              onMouseEnter={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px ${isDarkMode ? colors.Solid200A : colors.Solid300A}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 12px ${isDarkMode ? colors.Solid100A : colors.Solid200A}`;
                }
              }}
            />
          </section>

          {/* Help Text Section */}
          <section style={{
            color: isDarkMode ? colors.Solid700 : colors.Solid600,
            maxWidth: windowWidth > 1199 ? '35%' : windowWidth > 599 ? '45%' : '100%',
          }}>
            <p style={{
              fontSize: '12px',
              opacity: 0.8,
            }}>
              If you believe this is an error, please check your URL or contact support
              if the problem persists.
            </p>
          </section>
        </main>
      )}
    />
  );
};

export default PageNotFound;
