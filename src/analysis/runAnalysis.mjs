import { readFile } from "node:fs/promises";
import getFollowers from "../browser/inject/getFollowers.js";
import getFollowings from "../browser/inject/getFollowings.js";
import getMutualFollowers from "../browser/inject/getMutualFollowers.js";
import getUsernameId from "../browser/inject/getUserId.js";
import startBrowser from "../browser/session/browserManager.js";
import logger from "../loggers/logger.js";
import {
	saveFollowers as writeFollowers,
	saveFollowings as writeFollowings,
	saveMutuals as writeMutuals,
} from "../storage/saveResults.mjs";

const DEFAULT_MUTUAL_FETCH_DELAY_MS = 5000;

export default async function runAnalysis(username, overrides = {}) {
	const targetUsername = validateUsername(username);
	const deps = {
		...getDefaultDependencies(),
		...overrides,
	};

	logger.info(`Analysis started for username: ${targetUsername}`);

	const { browser, page } = await deps.startBrowser();

	try {
		const targetUserId = await fetchUserId(page, targetUsername, deps);
		const followers = await fetchFollowers(
			page,
			targetUsername,
			targetUserId,
			deps,
		);
		const followings = await fetchFollowings(
			page,
			targetUsername,
			targetUserId,
			deps,
		);
		const mutuals = await fetchMutualConnections(
			page,
			targetUsername,
			followings,
			deps,
		);

		return {
			username: targetUsername,
			userId: targetUserId,
			followers,
			followings,
			mutuals,
		};
	} finally {
		await closeBrowser(browser, page);
	}
}

function getDefaultDependencies() {
	return {
		startBrowser,
		getUserId: (page, username) => page.evaluate(getUsernameId, username),
		getFollowers: (page, userId) => page.evaluate(getFollowers, userId),
		getFollowings: (page, userId) => page.evaluate(getFollowings, userId),
		getMutualFollowers: (page, userId) =>
			page.evaluate(getMutualFollowers, userId),
		loadExistingMutuals,
		saveFollowers: writeFollowers,
		saveFollowings: writeFollowings,
		saveMutuals: writeMutuals,
		wait,
		mutualFetchDelayMs: getMutualFetchDelayMs(),
	};
}

function validateUsername(username) {
	const targetUsername = username?.trim();

	if (!targetUsername) {
		throw new Error("Missing required environment variable: IG_USERNAME");
	}

	if (!/^[A-Za-z0-9._]+$/.test(targetUsername)) {
		throw new Error(`Invalid Instagram username: ${targetUsername}`);
	}

	return targetUsername;
}

function getMutualFetchDelayMs() {
	const delay = Number(
		process.env.MUTUAL_FETCH_DELAY_MS ?? DEFAULT_MUTUAL_FETCH_DELAY_MS,
	);

	if (!Number.isFinite(delay) || delay < 0) {
		return DEFAULT_MUTUAL_FETCH_DELAY_MS;
	}

	return delay;
}

async function fetchUserId(page, username, deps) {
	const userId = await deps.getUserId(page, username);
	logger.info(`Retrieved user ID: ${userId}`);

	return userId;
}

async function fetchFollowers(page, username, userId, deps) {
	const followers = await deps.getFollowers(page, userId);
	assertArrayResult("followers", followers);
	assertUsersHaveIds("followers", followers);
	await deps.saveFollowers(username, followers);
	logger.info(`Saved ${followers.length} followers`);

	return followers;
}

async function fetchFollowings(page, username, userId, deps) {
	const followings = await deps.getFollowings(page, userId);
	assertArrayResult("followings", followings);
	assertUsersHaveIds("followings", followings);
	await deps.saveFollowings(username, followings);
	logger.info(`Saved ${followings.length} followings`);

	return followings;
}

async function fetchMutualConnections(page, username, followings, deps) {
	const previousMutuals = await deps.loadExistingMutuals(username);
	const data = mergeExistingMutuals(followings, previousMutuals);
	const numberOfFollowing = data.length;

	for (const user of data) {
		if (!Array.isArray(user.mutualFollowers)) {
			logger.info(
				`${data.indexOf(user) + 1}/${numberOfFollowing}. Fetching mutual followers for ${user.name || user.nickname}`,
			);
			const response = await deps.getMutualFollowers(page, user.userId);
			if (typeof response === "string") {
				await deps.saveMutuals(username, data);
				throw new Error(response);
			}
			user.mutualFollowers = response;
			await deps.saveMutuals(username, data);
			await deps.wait(deps.mutualFetchDelayMs);
		}
	}

	await deps.saveMutuals(username, data);
	logger.info(`Saved mutual follower data for ${data.length} followings`);

	return data;
}

async function loadExistingMutuals(username) {
	try {
		return JSON.parse(
			await readFile(`data/results/${username}_mutuals.json`, "utf8"),
		);
	} catch (error) {
		if (error.code === "ENOENT") {
			return [];
		}

		throw error;
	}
}

function mergeExistingMutuals(followings, previousMutuals) {
	const previousByUserId = new Map(
		previousMutuals.map((user) => [String(user.userId), user]),
	);

	return followings.map((user) => {
		const previous = previousByUserId.get(String(user.userId));

		if (Array.isArray(previous?.mutualFollowers)) {
			return {
				...user,
				mutualFollowers: previous.mutualFollowers,
			};
		}

		return { ...user };
	});
}

async function closeBrowser(browser, page) {
	logger.info("Process finished... Closing the browser");
	if (browser) {
		await browser.close();
		return;
	}

	if (page) {
		await page.close();
	}
}

function assertArrayResult(name, result) {
	if (!Array.isArray(result)) {
		throw new Error(`Expected ${name} scraper to return an array`);
	}
}

function assertUsersHaveIds(name, users) {
	const invalidUser = users.find((user) => !user?.userId);

	if (invalidUser) {
		throw new Error(
			`Expected every ${name} item to include userId. Invalid item: ${JSON.stringify(invalidUser).slice(0, 500)}`,
		);
	}
}

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
