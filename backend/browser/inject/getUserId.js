export default async function getUsernameId(username) {
    const userQueryRes = await fetch(
        `https://www.instagram.com/web/search/topsearch/?query=${encodeURIComponent(username)}`
    );

    const userQueryJson = await userQueryRes.json();

    const user = userQueryJson.users
        .map(u => u.user)
        .find(u => u.username === username);

    if (!user) {
        throw new Error("Utente non trovato in topsearch");
    }

    const userId = user.pk;

    return userId
}