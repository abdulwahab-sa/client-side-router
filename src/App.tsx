import CreateRouter from './router/index';
import RouteA from './pages/RouteA';
import Layout from './pages/Layout';
import React from 'react';

const routes = [
	{
		path: '/a',
		component: RouteA,
	},
	{
		path: '/b',
		component: React.lazy(() => import('./pages/RouteB')),
		isLazy: true,
		fallback: <div>Lazy fallback</div>,
	},
	{
		path: '/c',
		layout: Layout,
		component: React.lazy(() => import('./pages/RouteC')),
		isLazy: true,
		children: [
			{
				path: '/:userId',
				component: React.lazy(() => import('./pages/RouteD')),
				isLazy: true,
				children: [
					{
						path: '/e',
						component: React.lazy(() => import('./pages/RouteE')),
						isLazy: true,
						children: [
							{
								path: '/:postId',
								component: React.lazy(() => import('./pages/RouteF')),
								isLazy: true,
							},
						],
					},
				],
			},
		],
	},
];

function App() {
	return <CreateRouter routes={routes} />;
}

export default App;
