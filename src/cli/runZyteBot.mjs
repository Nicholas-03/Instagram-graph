import logger from "../loggers/logger.js";

const ZYTE_API_KEY = process.env.ZYTE_API_KEY;
const ZYTE_PROJECT_ID = process.env.ZYTE_PROJECT_ID;
const ZYTE_SPIDER = process.env.ZYTE_SPIDER;

function requiredEnv(name, value) {
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
}

async function runBot() {
	requiredEnv("ZYTE_API_KEY", ZYTE_API_KEY);
	requiredEnv("ZYTE_PROJECT_ID", ZYTE_PROJECT_ID);
	requiredEnv("ZYTE_SPIDER", ZYTE_SPIDER);

	const endpoint = "https://app.zyte.com/api/run.json";
	const payload = new URLSearchParams({
		project: ZYTE_PROJECT_ID,
		spider: ZYTE_SPIDER,
	});

	logger.info(
		`Scheduling Zyte bot '${ZYTE_SPIDER}' for project '${ZYTE_PROJECT_ID}'`,
	);

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${ZYTE_API_KEY}:`).toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: payload.toString(),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(
			`Failed to schedule Zyte bot (${response.status} ${response.statusText}): ${body}`,
		);
	}

	const result = await response.json();
	logger.info({ result }, "Zyte bot scheduled successfully");
}

try {
	await runBot();
} catch (error) {
	logger.error(error);
	process.exitCode = 1;
}
