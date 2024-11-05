import { CustomLink } from '../router';

const RouteB = () => {
	return (
		<div>
			RouteB
			<CustomLink to="/a">Test A</CustomLink>
		</div>
	);
};

export default RouteB;
