function getProfilePicUrl(url) {
	if (!url) {
		return "";
	}

	return `/api/image?url=${encodeURIComponent(url)}`;
}

function clearFocus(cy) {
	cy.elements().removeClass("faded highlighted");
}

function focusNodeNeighborhood(cy, node) {
	const connected = node.closedNeighborhood();

	cy.elements().addClass("faded");
	connected.removeClass("faded").addClass("highlighted");
}

function getGraphLayoutOptions() {
	return {
		name: "fcose",
		quality: "default",
		randomize: true,
		animate: false,
		fit: false,
		padding: 60,
		nodeSeparation: 180,
		idealEdgeLength: 240,
		edgeElasticity: 0.15,
		nodeRepulsion: 28000,
	};
}

function getCollectionCenter(collection) {
	const boundingBox = collection.boundingBox();

	return {
		x: boundingBox.x1 + boundingBox.w / 2,
		y: boundingBox.y1 + boundingBox.h / 2,
		radius: Math.max(boundingBox.w, boundingBox.h) / 2,
	};
}

function createSeededRandom(seedText) {
	let seed = 0;

	for (let index = 0; index < seedText.length; index += 1) {
		seed = Math.imul(31, seed) + seedText.charCodeAt(index);
	}

	return () => {
		seed += 0x6d2b79f5;
		let value = seed;
		value = Math.imul(value ^ (value >>> 15), value | 1);
		value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

		return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
	};
}

function expandBoundingBox(boundingBox, margin) {
	return {
		x1: boundingBox.x1 - margin,
		x2: boundingBox.x2 + margin,
		y1: boundingBox.y1 - margin,
		y2: boundingBox.y2 + margin,
	};
}

function getRandomPosition(random, bounds) {
	return {
		x: bounds.x1 + random() * (bounds.x2 - bounds.x1),
		y: bounds.y1 + random() * (bounds.y2 - bounds.y1),
	};
}

function getEdgeBandPosition(random, clusterBox, bounds) {
	const side = Math.floor(random() * 4);

	if (side === 0) {
		return {
			x: bounds.x1 + random() * (bounds.x2 - bounds.x1),
			y: bounds.y1 + random() * Math.max(1, clusterBox.y1 - bounds.y1),
		};
	}

	if (side === 1) {
		return {
			x: clusterBox.x2 + random() * Math.max(1, bounds.x2 - clusterBox.x2),
			y: bounds.y1 + random() * (bounds.y2 - bounds.y1),
		};
	}

	if (side === 2) {
		return {
			x: bounds.x1 + random() * (bounds.x2 - bounds.x1),
			y: clusterBox.y2 + random() * Math.max(1, bounds.y2 - clusterBox.y2),
		};
	}

	return {
		x: bounds.x1 + random() * Math.max(1, clusterBox.x1 - bounds.x1),
		y: bounds.y1 + random() * (bounds.y2 - bounds.y1),
	};
}

function isFarEnough(position, otherPositions, minDistance) {
	return otherPositions.every((otherPosition) => {
		return (
			Math.hypot(position.x - otherPosition.x, position.y - otherPosition.y) >=
			minDistance
		);
	});
}

function getIsolatedScatterPosition({
	random,
	bounds,
	clusterBox,
	connectedPositions,
	placedPositions,
}) {
	const minConnectedDistance = 92;
	const minIsolatedDistance = 58;
	const maxAttempts = 250;

	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const position = getRandomPosition(random, bounds);

		if (
			isFarEnough(position, connectedPositions, minConnectedDistance) &&
			isFarEnough(position, placedPositions, minIsolatedDistance)
		) {
			return position;
		}
	}

	for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
		const position = getEdgeBandPosition(random, clusterBox, bounds);

		if (isFarEnough(position, placedPositions, minIsolatedDistance)) {
			return position;
		}
	}

	return getEdgeBandPosition(random, clusterBox, bounds);
}

function scatterIsolatedNodesAroundGraph(cy) {
	const isolatedNodes = cy
		.nodes()
		.filter((node) => node.connectedEdges().length === 0)
		.toArray()
		.sort((a, b) => {
			const aLabel = a.data("label") || a.data("username") || a.id();
			const bLabel = b.data("label") || b.data("username") || b.id();

			return aLabel.localeCompare(bLabel);
		});

	if (isolatedNodes.length === 0) {
		return { isolatedCount: 0 };
	}

	const connectedNodes = cy
		.nodes()
		.filter((node) => node.connectedEdges().length > 0);
	const center =
		connectedNodes.length > 0
			? getCollectionCenter(connectedNodes)
			: { x: 0, y: 0, radius: 0 };
	const clusterBox =
		connectedNodes.length > 0
			? connectedNodes.boundingBox()
			: { x1: -300, x2: 300, y1: -300, y2: 300 };
	const bounds = expandBoundingBox(
		clusterBox,
		Math.max(320, center.radius * 0.22),
	);
	const connectedPositions = connectedNodes.map((node) => node.position());
	const placedPositions = [];
	const random = createSeededRandom(
		isolatedNodes.map((node) => node.id()).join(":"),
	);

	for (const node of isolatedNodes) {
		const position = getIsolatedScatterPosition({
			random,
			bounds,
			clusterBox,
			connectedPositions,
			placedPositions,
		});

		node.position(position);
		placedPositions.push(position);
	}

	return {
		isolatedCount: isolatedNodes.length,
		scatterBounds: bounds,
	};
}

function getLayoutStats(cy) {
	const isolatedNodes = cy
		.nodes()
		.filter((node) => node.connectedEdges().length === 0);
	const connectedNodes = cy
		.nodes()
		.filter((node) => node.connectedEdges().length > 0);

	return {
		nodeCount: cy.nodes().length,
		edgeCount: cy.edges().length,
		isolatedCount: isolatedNodes.length,
		connectedCount: connectedNodes.length,
		isolatedBoundingBox: isolatedNodes.boundingBox(),
		connectedBoundingBox: connectedNodes.boundingBox(),
	};
}

async function loadGraph() {
	const followings = await fetch(
		"../../data/results/nicholasboidi_followings.json",
	).then((r) => r.json());

	const nodes = followings.map((user) => ({
		data: {
			id: user.userId,
			label: user.name || user.nickname,
			username: user.nickname,
			isPrivate: user.isPrivate,
			followedByViewer: user.followedByViewer,
			profilePic: getProfilePicUrl(user.profilePic),
		},
	}));

	const edges = await fetch("../../data/results/edges.json").then((r) =>
		r.json(),
	);

	const cy = cytoscape({
		container: document.getElementById("cy"),
		elements: [...nodes, ...edges],
		style: [
			{
				selector: "node",
				style: {
					label: "data(label)",
					color: "#f5f5f5",
					"font-size": 11,
					"min-zoomed-font-size": 10,
					"text-valign": "bottom",
					"text-halign": "center",
					"text-margin-y": 10,
					"text-background-color": "#0b1220",
					"text-background-opacity": 0.75,
					"text-background-padding": 3,
					"text-outline-color": "#111",
					"text-outline-width": 2,
					"background-image": "data(profilePic)",
					"background-fit": "cover",
					"background-width": "100%",
					"background-height": "100%",
					"background-position-x": "50%",
					"background-position-y": "50%",
					"background-clip": "node",
					"background-image-containment": "over",
					"background-image-crossorigin": "anonymous",
					"background-color": "#3b82f6",
					"border-width": 2,
					"border-color": "#111827",
					shape: "ellipse",
					width: 30,
					height: 30,
				},
			},
			{
				selector: "node[?isPrivate]",
				style: {
					"border-color": "#f59e0b",
					"border-width": 2,
				},
			},
			{
				selector: "edge",
				style: {
					width: 1,
					"line-color": "#9ca3af",
					opacity: 0.16,
					"curve-style": "haystack",
				},
			},
			{
				selector: "node.faded",
				style: {
					opacity: 0.2,
					"text-opacity": 0.1,
				},
			},
			{
				selector: "edge.faded",
				style: {
					opacity: 0.03,
				},
			},
			{
				selector: "node.highlighted",
				style: {
					opacity: 1,
					"border-color": "#22d3ee",
					"border-width": 3,
					"text-opacity": 1,
				},
			},
			{
				selector: "edge.highlighted",
				style: {
					"line-color": "#22d3ee",
					opacity: 0.9,
					width: 2,
				},
			},
		],
		hideEdgesOnViewport: true,
		hideLabelsOnViewport: false,
		minZoom: 0.2,
		maxZoom: 4,
	});

	window.cy = cy;

	const layout = cy.layout(getGraphLayoutOptions());

	layout.on("layoutstop", () => {
		window.isolatedScatterLayout = scatterIsolatedNodesAroundGraph(cy);
		window.graphLayoutStats = getLayoutStats(cy);
		cy.fit(cy.elements(), 70);
	});

	layout.run();

	cy.on("tap", "node", (event) => {
		const node = event.target;
		focusNodeNeighborhood(cy, node);
		console.log(node.data());
	});

	cy.on("tap", (event) => {
		if (event.target === cy) {
			clearFocus(cy);
		}
	});
}

window.onload = () => {
	loadGraph().catch(console.error);
};
