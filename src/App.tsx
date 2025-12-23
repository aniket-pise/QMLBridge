import { createHashRouter, RouterProvider } from 'react-router-dom';
import {
	AboutPage, DocumentationPage, FaqsPage, FeaturesPage,
	LandingPage, PageNotFound, PrivacyPolicyPage,
	TermsOfServicePage, TransformPage,
} from './pages';

/**
 * Root application component.
 *
 * Uses React Router's `createHashRouter` to ensure reliable client-side
 * routing when deployed on static hosting platforms like GitHub Pages.
 *
 * Hash-based routing prevents 404 errors on page refreshes and direct
 * URL access, since GitHub Pages does not support server-side route
 * rewriting for single-page applications.
 *
 * All application routes are defined here and rendered via `RouterProvider`,
 * with React Router v7 future flags enabled for forward compatibility.
 */
const App: React.FC = () => {
	return (
		<RouterProvider
			router={createHashRouter(
				[
					{ path: '/', element: <LandingPage /> },
					{ path: '/about', element: <AboutPage /> },
					{ path: '/documentation', element: <DocumentationPage /> },
					{ path: '/faq', element: <FaqsPage /> },
					{ path: '/features', element: <FeaturesPage /> },
					{ path: '/privacy_policy', element: <PrivacyPolicyPage /> },
					{ path: '/terms_of_service', element: <TermsOfServicePage /> },
					{ path: '/transform', element: <TransformPage /> },
					{ path: '*', element: <PageNotFound /> },
				],
				{
					future: {
						v7_relativeSplatPath: true,
						v7_fetcherPersist: true,
						v7_normalizeFormMethod: true,
						v7_partialHydration: true,
						v7_skipActionErrorRevalidation: true,
					}
				}
			)}
			future={{ v7_startTransition: true }}
		/>
	);
};

export default App;
