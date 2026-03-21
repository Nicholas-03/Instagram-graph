export default async function getUserId(username) {
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

    return userId
}