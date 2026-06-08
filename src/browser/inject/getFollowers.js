export default async function getFollowers(userId) {
	let followers = [];
	let after = null;
	let has_next = true;

	while (has_next) {
		const res = await fetch(
			`https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
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

		if (!res?.data?.user?.edge_followed_by) {
			throw new Error(
				`Risposta followers inattesa: ${JSON.stringify(res).slice(0, 500)}`,
			);
		}

		has_next = res.data.user.edge_followed_by.page_info.has_next_page;
		after = res.data.user.edge_followed_by.page_info.end_cursor;

		followers = followers.concat(
			res.data.user.edge_followed_by.edges.map(({ node }) => ({
				userId: node.id != null ? String(node.id) : null,
				nickname: node.username,
				name: node.full_name,
				profilePic: node.profile_pic_url,
				isPrivate: node.is_private,
				followedByViewer: node.followed_by_viewer,
			})),
		);
	}

	return followers;
}
