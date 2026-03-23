export default async function getUsernameId(username) {
	const res = await fetch(
		`https://www.instagram.com/web/search/topsearch/?query=${encodeURIComponent(username)}`,
	);

	const text = await res.text();
	console.log(text);

	if (!text.trim().startsWith("{")) {
		throw new Error(`Instagram non ha restituito JSON: ${text}`);
	}

	const userQueryJson = JSON.parse(text);

	const user = userQueryJson.users
		.map((u) => u.user)
		.find((u) => u.username === username);

	if (!user) {
		throw new Error("Utente non trovato in topsearch");
	}

	const userId = user.pk;

	return userId;
}
