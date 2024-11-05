import { CustomLink, useQueryParams } from '../router';

const RouteA = () => {
	const { queryParams, updateQueryParams } = useQueryParams();

	return (
		<div>
			RouteA
			<CustomLink to="/b">Test Link</CustomLink>
			{queryParams?.mode}
			{queryParams?.id}
			{queryParams?.product}
			<button onClick={() => updateQueryParams({ product: 'tshirt' })}>Update</button>
		</div>
	);
};

export default RouteA;
