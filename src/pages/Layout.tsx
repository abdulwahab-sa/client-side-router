import { ReactNode } from 'react';

const Layout = ({ children }: { children?: ReactNode }) => {
	return (
		<div>
			Layoutssd
			{children ? children : null}
		</div>
	);
};

export default Layout;
