export default async function getFollowings(userId) {
    let followings = []
    after = null;
    has_next = true;

    while (has_next) {
        await fetch(
            `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
            encodeURIComponent(
                JSON.stringify({
                    id: userId,
                    include_reel: true,
                    fetch_mutual: true,
                    first: 50,
                    after: after,
                })
            )
        )
            .then((res) => res.json())
            .then((res) => {
                has_next = res.data.user.edge_follow.page_info.has_next_page;
                after = res.data.user.edge_follow.page_info.end_cursor;
                followings = followings.concat(
                    res.data.user.edge_follow.edges.map(({ node }) => {
                        return {
                            username: node.username,
                            full_name: node.full_name,
                        };
                    })
                );
            });
    }

    return followings
}