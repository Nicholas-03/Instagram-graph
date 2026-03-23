import path from "node:path";
import { Readable } from "node:stream";
import express from "express";

const app = express();
const rootDir = path.resolve();
const port = Number(process.env.PORT || 5173);

app.use("/data", express.static(path.join(rootDir, "data")));
app.use("/src/graph", express.static(path.join(rootDir, "src/graph")));

app.get("/", (_req, res) => {
	res.redirect("/src/graph/index.html");
});

app.get("/api/image", async (req, res) => {
	const rawUrl = req.query.url;

	if (typeof rawUrl !== "string" || rawUrl.length === 0) {
		res.status(400).send("Missing image url");
		return;
	}

	let imageUrl;
	try {
		imageUrl = new URL(rawUrl);
	} catch {
		res.status(400).send("Invalid image url");
		return;
	}

	if (imageUrl.protocol !== "https:") {
		res.status(400).send("Only https URLs are allowed");
		return;
	}

	try {
		const response = await fetch(imageUrl.toString(), {
			headers: {
				"user-agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
				referer: "https://www.instagram.com/",
			},
		});

		if (!response.ok || !response.body) {
			res.status(502).send("Unable to fetch image");
			return;
		}

		const contentType = response.headers.get("content-type") || "image/jpeg";
		res.setHeader("Content-Type", contentType);
		res.setHeader("Cache-Control", "public, max-age=3600");
		Readable.fromWeb(response.body).pipe(res);
	} catch {
		res.status(502).send("Unable to fetch image");
	}
});

app.listen(port, () => {
	console.log(`Graph server running at http://localhost:${port}`);
});
