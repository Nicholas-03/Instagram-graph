import { mkdir, readFile, writeFile } from "node:fs/promises";

export default async function buildWeightedEdges() {
	const data = JSON.parse(
		await readFile("data/results/nicholasboidi_mutuals.json", "utf8"),
	);

	const knownUserIds = new Set(data.map((user) => String(user.userId)));
	const edgeMap = new Map();

	for (const user of data) {
		const sourceId = String(user.userId);
		const mutuals = Array.isArray(user.mutualFollowers)
			? user.mutualFollowers
			: [];

		for (const mutual of mutuals) {
			const targetId = String(mutual.userId);

			if (!knownUserIds.has(targetId) || sourceId === targetId) continue;

			const [a, b] = [sourceId, targetId].sort();
			const key = `${a}-${b}`;

			edgeMap.set(key, (edgeMap.get(key) ?? 0) + 1);
		}
	}

	const edges = [...edgeMap.entries()].map(([key, weight]) => {
		const [source, target] = key.split("-");
		return {
			data: {
				id: key,
				source,
				target,
				weight,
			},
		};
	});

	await mkdir("data/results", { recursive: true });
	await writeFile(
		"data/results/edges.json",
		JSON.stringify(edges, null, 2),
		"utf8",
	);

	return edges;
}

buildWeightedEdges().catch(console.error);
