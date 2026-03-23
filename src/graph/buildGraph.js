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
            profilePic: user.profilePic,
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
                    "label": "data(label)",
                    "color": "#f5f5f5",
                    "font-size": 10,
                    "text-valign": "bottom",
                    "text-halign": "center",
                    "text-margin-y": 8,
                    "text-outline-color": "#111",
                    "text-outline-width": 2,
                    "background-image": "data(profilePic)",
                    "background-fit": "cover",
                    "background-color": "#3b82f6",
                    "border-width": 2,
                    "border-color": "#222",
                    "width": 24,
                    "height": 24
                }
            },
            {
                selector: "node[?isPrivate]",
                style: {
                    "border-color": "#f59e0b",
                    "border-width": 2
                }
            },
            {
                selector: "edge",
                style: {
                    "width": 1,
                    "line-color": "#888",
                    "opacity": 0.18,
                    "curve-style": "haystack"
                }
            }
        ],
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        layout: {
            name: "fcose",
            quality: "default",
            randomize: true,
            animate: false,
            fit: true,
            padding: 40,
            nodeSeparation: 120,
            idealEdgeLength: 140,
            edgeElasticity: 0.15,
            nodeRepulsion: 15000
        }
    });


    cy.on("tap", "node", (event) => {
        console.log(event.target.data());
    });
}

window.onload = (event) => {
    loadGraph().catch(console.error);
};
