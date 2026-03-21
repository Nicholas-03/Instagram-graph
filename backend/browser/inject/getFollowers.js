import { get } from "https";

export default async function getFollowers(page, username, target_user) {
    const followers = await page.evaluate(async (username) => {
        const userQueryRes = await fetch(
            `https://www.instagram.com/web/search/topsearch/?query=${encodeURIComponent(username)}`
        );

        const userQueryJson = await userQueryRes.json();

        if (!Array.isArray(userQueryJson.users)) {
            throw new Error(
                "Risposta topsearch inattesa: " + JSON.stringify(userQueryJson).slice(0, 500)
            );
        }

        const user = userQueryJson.users
            .map(u => u.user)
            .find(u => u.username === username);

        if (!user) {
            throw new Error("Utente non trovato in topsearch");
        }

        const userId = user.pk;

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
                    })
                )
            ).then(r => r.json());

            if (!res?.data?.user?.edge_followed_by) {
                throw new Error(
                    "Risposta followers inattesa: " + JSON.stringify(res).slice(0, 500)
                );
            }

            has_next = res.data.user.edge_followed_by.page_info.has_next_page;
            after = res.data.user.edge_followed_by.page_info.end_cursor;

            followers = followers.concat(
                res.data.user.edge_followed_by.edges.map(({ node }) => ({
                    username: node.username,
                    full_name: node.full_name,
                }))
            );
        }

        return followers;
    }, target_user)

    return followers
}