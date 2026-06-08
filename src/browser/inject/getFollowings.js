export default async function getFollowings(userId) {
	let followings = [];
	let after = null;
	let has_next = true;

	while (has_next) {
		const res = await fetch(
			`https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
				encodeURIComponent(
					JSON.stringify({
						id: userId,
						include_reel: true,
						fetch_mutual: true,
						first: 50,
						after: after,
					}),
				),
		).then((r) => r.json());

		if (!res?.data?.user?.edge_follow) {
			throw new Error(
				`Risposta followings inattesa: ${JSON.stringify(res).slice(0, 500)}`,
			);
		}

		has_next = res.data.user.edge_follow.page_info.has_next_page;
		after = res.data.user.edge_follow.page_info.end_cursor;
		followings = followings.concat(
			res.data.user.edge_follow.edges.map(({ node }) => ({
				userId: node.id != null ? String(node.id) : null,
				nickname: node.username,
				name: node.full_name,
				profilePic: node.profile_pic_url,
				isPrivate: node.is_private,
				followedByViewer: node.followed_by_viewer,
			})),
		);
	}

	return followings;
}
