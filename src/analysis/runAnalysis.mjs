import getFollowers from "../browser/inject/getFollowers.js";
import getFollowings from "../browser/inject/getFollowings.js";
import getUsernameId from "../browser/inject/getUserId.js";
import startBrowser from "../browser/session/browserManager.js";
import logger from "../loggers/logger.js";
import {
	saveFollowers,
	saveFollowings,
	saveResults,
} from "../storage/saveResults.mjs";

export default async function runAnalysis(username) {
	logger.info(`Analysis started for username: ${username}`);

	const { browser, page } = await startBrowser();

	const userId = await page.evaluate(getUsernameId, username);
	logger.info(`Retrieved user ID: ${userId}`);

	// let followers = await page.evaluate(getFollowers, userId)
	// logger.info(followers)
	// await saveFollowers(username, followers)

	// let followings = await page.evaluate(getFollowings, userId)
	// logger.info(followings)
	// await saveFollowings(username, followings)

	logger.info("Process finished... Closing the browser");
	await page.close();
	await browser.close();
}
