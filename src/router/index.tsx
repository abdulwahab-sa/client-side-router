import React, { Suspense, useEffect } from 'react';
import NotFound from './NotFound';
import { useState } from 'react';

interface Route {
	path: string;
	children?: Route[];
	component: React.LazyExoticComponent<React.FC> | (() => JSX.Element);
	fallback?: React.ReactNode;
	isLazy?: boolean;
	layout?: React.FC<{ children?: React.ReactNode }>;
}

interface MatchedRoute {
	route: Route;
	layout: React.FC<{ children?: React.ReactNode }> | undefined | null;
	params: Record<string, string>;
	queryParams: Record<string, string>;
	fallback: React.ReactNode;
}

let currentRouteParams: Record<string, string> = {};

export default function CreateRouter({ routes }: { routes: Route[] }) {
	const [currentPath, setCurrentPath] = useState(window.location.pathname);

	useEffect(() => {
		const handleLocationChange = () => {
			setCurrentPath(window.location.pathname);
		};

		window.addEventListener('popstate', handleLocationChange);

		return () => {
			window.removeEventListener('popstate', handleLocationChange);
		};
	}, []);

	const navigate = (path: string): void => {
		window.history.pushState({}, '', path);
		setCurrentPath(path);
	};

	const RenderRoute = (route: MatchedRoute): JSX.Element | undefined => {
		const Component = route.route.component;

		if (route.layout) {
			const Layout = route.layout;
			// LAZY COMPONENTS WITH LAYOUT
			if (route.route.isLazy) {
				//const LazyComponent = lazy(Component);
				return (
					<Layout>
						<Suspense fallback={route.fallback ?? <div>Loading...</div>}>
							<Component />
						</Suspense>
					</Layout>
				);
			}

			return (
				<Layout>
					<Component />;
				</Layout>
			);
		}

		// LAZY COMPONENTS WITHOUT LAYOUT

		if (!route.layout && route.route.isLazy) {
			//const LazyComp = lazy(Component);
			return (
				<Suspense>
					<Component />
				</Suspense>
			);
		}
		if (!route.layout && !route.route.isLazy) {
			return <Component />;
		}
	};

	const matchRoute = () => {
		const findRoute = (routes: Route[], parentPath: string = ''): MatchedRoute | undefined => {
			for (const route of routes) {
				// Construct the full path by combining parent path and current route path
				const fullPath = parentPath + (route.path.startsWith('/') ? route.path : '/' + route.path);
				console.log('currentPath', currentPath);
				console.log('fullPath', fullPath);
				// Split the paths into segments for comparison
				const pathSegments = fullPath.split('/').filter(Boolean);
				const currentSegments = currentPath.split('/').filter(Boolean);
				console.log('pathSegments', pathSegments);
				console.log('currentSegments', currentSegments);
				// Check if the number of segments matches
				if (pathSegments.length === currentSegments.length) {
					const params: Record<string, string> = {};

					// Compare each segment
					const isMatch = pathSegments.every((segment, index) => {
						if (segment.startsWith(':')) {
							// This is a dynamic segment
							const paramName = segment.slice(1); // Remove the ':' prefix
							params[paramName] = currentSegments[index]; // Store the actual value
							//updateParams(paramName, currentSegments[index]);
							return true; // Dynamic segments always match
						}
						// For non-dynamic segments, check for exact match
						return segment === currentSegments[index];
					});

					if (isMatch) {
						const queryParams: Record<string, string> = {};
						const urlObject = new URL(window.location.href);
						const queryString = new URLSearchParams(urlObject.search);

						queryString.forEach((value, key) => {
							queryParams[key] = value;
						});

						return {
							route: route,
							layout: route.layout ?? null,
							params: params,
							queryParams: queryParams,
							fallback: route.fallback ?? null,
						};
					}
				}

				// If we haven't found an exact match, check if this could be a parent of our target route
				// We do this if either:
				// 1. The current path starts with this route's path (normal nesting)
				// 2. This route's path includes a dynamic segment (because dynamic segments can match anything)
				if (currentPath.startsWith(fullPath) || fullPath.includes(':')) {
					// If this route has children, recursively check them
					if ('children' in route && route.children) {
						const childMatch = findRoute(route.children, fullPath);
						if (childMatch) {
							// If we find a match in the children, we need to combine the params
							// from this level with the child params
							return {
								...childMatch,
								layout: childMatch.layout ?? route.layout,
								params: { ...childMatch.params },
								fallback: childMatch.fallback ?? route.fallback,
							};
						}
					}
				}
				//console.log('params', params);
			}

			// If we've checked all routes and found no match, return undefined
			return undefined;
		};

		const matchedRoute = findRoute(routes);
		if (!matchedRoute) return <NotFound />;
		currentRouteParams = matchedRoute.params;
		//console.log('matchedRoute', matchedRoute);
		return RenderRoute(matchedRoute);
	};

	return <>{matchRoute()}</>;
}

export const CustomLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		window.history.pushState({}, '', to);
		window.dispatchEvent(new PopStateEvent('popstate'));
	};

	return (
		<a href={to} onClick={handleClick}>
			{children}
		</a>
	);
};

// Custom hook to access route params
export const useParams = () => {
	return { ...currentRouteParams };
};

export const useQueryParams = () => {
	const [queryParams, setQueryParams] = useState<Record<string, string>>({});

	const parseQueryString = (url: string) => {
		const params: Record<string, string> = {};
		const queryString = url.split('?')[1];

		if (queryString) {
			queryString.split('&').forEach((param) => {
				const [key, value] = param.split('=').map(decodeURIComponent);
				params[key] = value;
			});
		}

		return params;
	};

	const updateQueryParams = (newParams: Record<string, string>) => {
		const currentUrl = window.location.href.split('?')[0];
		const updatedParams = { ...queryParams, ...newParams };

		const queryString = Object.entries(updatedParams)
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
			.join('&');

		window.history.pushState({}, '', `${currentUrl}?${queryString}`);
		setQueryParams(updatedParams);
	};

	useEffect(() => {
		const currentParams = parseQueryString(window.location.href);
		setQueryParams(currentParams);

		const handlePopState = () => {
			const updatedParams = parseQueryString(window.location.href);
			setQueryParams(updatedParams);
		};

		window.addEventListener('popstate', handlePopState);
		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	}, []);

	return { queryParams, updateQueryParams };
};
