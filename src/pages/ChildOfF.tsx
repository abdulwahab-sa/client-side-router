import { useParams } from '../router';

const ChildOfF = () => {
	const { userId, postId } = useParams();
	return (
		<p>
			userId is {userId} <br />
			postId is {postId}
		</p>
	);
};

export default ChildOfF;
