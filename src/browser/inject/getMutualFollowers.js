export default async function getMutualFollowers(userId) {
    const mutualFollowers = [];
    let maxId = null;

    do {
        const url = new URL(
            `https://www.instagram.com/api/v1/friendships/${userId}/mutual_followers/`
        );

        url.searchParams.set("page_size", "12");

        if (maxId !== null) {
            url.searchParams.set("max_id", maxId);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "x-ig-app-id": "936619743392459",
            },
        });

        const text = await response.text();

        console.log("status:", response.status);
        console.log("url:", response.url);
        console.log(text.slice(0, 500));

        if (text.trim().startsWith("<")) {
            throw new Error(`Risposta HTML invece che JSON: ${text.slice(0, 200)}`);
        }

        const res = JSON.parse(text);

        if (!res?.users) {
            throw new Error(
                `Risposta mutual followers inattesa: ${JSON.stringify(res).slice(0, 500)}`
            );
        }

        mutualFollowers.push(
            ...res.users.map((user) => ({
                userId: user.id,
                username: user.username,
                full_name: user.full_name,
            }))
        );

        maxId = res.next_max_id;
    } while (maxId !== null);

    return mutualFollowers;
}
