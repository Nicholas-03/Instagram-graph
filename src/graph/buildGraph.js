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
                    "label": "data(label)",
                    "color": "#f5f5f5",
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
                    "shape": "ellipse",
                    "width": 30,
                    "height": 30
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
                    "line-color": "#9ca3af",
                    "opacity": 0.16,
                    "curve-style": "haystack"
                }
            },
            {
                selector: "node.faded",
                style: {
                    "opacity": 0.2,
                    "text-opacity": 0.1
                }
            },
            {
                selector: "edge.faded",
                style: {
                    "opacity": 0.03
                }
            },
            {
                selector: "node.highlighted",
                style: {
                    "opacity": 1,
                    "border-color": "#22d3ee",
                    "border-width": 3,
                    "text-opacity": 1
                }
            },
            {
                selector: "edge.highlighted",
                style: {
                    "line-color": "#22d3ee",
                    "opacity": 0.9,
                    "width": 2
                }
            }
        ],
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: false,
        minZoom: 0.2,
        maxZoom: 4,
        wheelSensitivity: 0.2,
        layout: {
            name: "fcose",
            quality: "default",
            randomize: true,
            animate: false,
            fit: true,
            padding: 60,
            nodeSeparation: 180,
            idealEdgeLength: 240,
            edgeElasticity: 0.15,
            nodeRepulsion: 28000
        }
    });


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

window.onload = (event) => {
    loadGraph().catch(console.error);
};
