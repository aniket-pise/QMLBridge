import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LightModeNeutrals, DarkModeNeutrals } from '../../constants/colors';

// Defines the possible theme types.
type Theme = 'light' | 'dark';

// Defines the shape of the theme context provided to children components.
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof LightModeNeutrals | typeof DarkModeNeutrals;
}

// Create a context to hold the theme information.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider component that wraps the application to provide theme context.
 * It detects the user's system preference for dark or light mode and makes the
 * current theme and corresponding color palette available to all child components.
 * 
 * @param {object} props - The properties for the component.
 * @param {ReactNode} props.children - The child components to be rendered within the provider.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // State to hold the current theme ('light' or 'dark').
  const [theme, setTheme] = useState<Theme>('light');

  // Effect to detect system theme changes.
  useEffect(() => {
    // Media query to check for dark mode preference.
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler to update the theme state based on the media query match.
    const handleChange = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set the initial theme based on the current system preference.
    handleChange();

    // Listen for changes.
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup listener on component unmount.
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Select the color palette based on the current theme.
  const colors = theme === 'light' ? LightModeNeutrals : DarkModeNeutrals;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to consume the ThemeContext.
 * This provides an easy way for components to access the current theme,
 * the function to set the theme, and the theme-specific color palette.
 * 
 * @returns {ThemeContextType} The theme context value.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export const useTheme = () => {
  // Access the theme context.
  const context = useContext(ThemeContext);

  // Ensure the hook is used within a component wrapped by ThemeProvider.
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  // Return the context, making it available to the component.
  return context;
};
