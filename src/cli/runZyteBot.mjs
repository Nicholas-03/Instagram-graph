import logger from "../loggers/logger.js";
import runAnalysis from "../analysis/runAnalysis.mjs";

const SHUB_JOB_DATA = process.env.SHUB_JOB_DATA;

function parseJobData(raw) {
	if (!raw) {
		return {};
	}

	try {
		return JSON.parse(raw);
	} catch {
		logger.warn("Unable to parse SHUB_JOB_DATA as JSON");
		return {};
	}
}

function getProjectIdFromJobKey(jobKey) {
	if (!jobKey) {
		return undefined;
	}

	return jobKey.split("/")[0];
}

const jobData = parseJobData(SHUB_JOB_DATA);
const spiderArgs = jobData.spider_args || {};

function getSpiderArg(...keys) {
	for (const key of keys) {
		if (spiderArgs[key]) {
			return spiderArgs[key];
		}
	}

	return undefined;
}

const ZYTE_PROJECT_ID = getProjectIdFromJobKey(process.env.SHUB_JOBKEY);
const IG_USERNAME =
	process.env.IG_USERNAME ||
	getSpiderArg("IG_USERNAME", "ig_username", "username", "USER");
const IG_PASSWORD =
	process.env.IG_PASSWORD ||
	getSpiderArg("IG_PASSWORD", "ig_password", "password", "PASS");

function requiredEnv(name, value) {
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
}

async function runBot() {
	requiredEnv(
		"IG_USERNAME (or spider_args.IG_USERNAME / spider_args.ig_username / spider_args.username)",
		IG_USERNAME,
	);
	requiredEnv(
		"IG_PASSWORD (or spider_args.IG_PASSWORD / spider_args.ig_password / spider_args.password)",
		IG_PASSWORD,
	);

	// Set environment variables for browserManager
	process.env.IG_USERNAME = IG_USERNAME;
	process.env.IG_PASSWORD = IG_PASSWORD;

	logger.info(
		`Running direct analysis for '${IG_USERNAME}'${
			ZYTE_PROJECT_ID ? ` in project '${ZYTE_PROJECT_ID}'` : ""
		}`,
	);

	await runAnalysis(IG_USERNAME);
	logger.info("Direct analysis completed successfully");
}

try {
	await runBot();
} catch (error) {
	logger.error(error);
	process.exitCode = 1;
}
