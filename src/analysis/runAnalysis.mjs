import { readFile } from "node:fs/promises";
import getFollowers from "../browser/inject/getFollowers.js";
import getFollowings from "../browser/inject/getFollowings.js";
import getMutualFollowers from "../browser/inject/getMutualFollowers.js";
import getUsernameId from "../browser/inject/getUserId.js";
import startBrowser from "../browser/session/browserManager.js";
import logger from "../loggers/logger.js";
import {
	saveFollowers,
	saveFollowings,
	saveMutuals,
} from "../storage/saveResults.mjs";

export default async function runAnalysis(username) {
	logger.info(`Analysis started for username: ${username}`);

	const { browser, page } = await startBrowser();

	const _usernameId = await userId(page, username);

	//let followingsJson = await followings(page, userId)
	//let followersJson = await followers(page, userId)

	await connections(page, userId);

	await closeBrowser(browser, page);
}

async function userId(page, username) {
	const userId = await page.evaluate(getUsernameId, username);
	logger.info(`Retrieved user ID: ${userId}`);

	return userId;
}

async function _followers(page, userId) {
	const followers = await page.evaluate(getFollowers, userId);
	logger.info(followers);
	await saveFollowers(username, followers);

	return followers;
}

async function _followings(page, userId) {
	const followings = await page.evaluate(getFollowings, userId);
	logger.info(followings);
	await saveFollowings(username, followings);

	return followings;
}

async function connections(page, userId) {
	const data = JSON.parse(
		await readFile("data/results/nicholasboidi_mutuals.json", "utf8"),
	);
	const numberOfFollowing = data.length;

	for (const user of data) {
		if (!Object.hasOwn(user, "mutualFollowers")) {
			logger.info(
				`${data.indexOf(user)}/${numberOfFollowing}. Fetching data for ${user.name}`,
			);
			const response = await page.evaluate(getMutualFollowers, user.userId);
			if (typeof response === "string") {
				logger.error(response);
				break;
			}
			user.mutualFollowers = response;
			await new Promise((r) => setTimeout(r, 5000));
		}
	}

	await saveMutuals("nicholasboidi", data);
}

async function closeBrowser(browser, page) {
	logger.info("Process finished... Closing the browser");
	await page.close();
	await browser.close();
}
