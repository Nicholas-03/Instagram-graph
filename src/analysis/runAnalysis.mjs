import getFollowers from "../browser/inject/getFollowers.js";
import getFollowings from "../browser/inject/getFollowings.js";
import getMutualFollowers from "../browser/inject/getMutualFollowers.js";
import getUsernameId from "../browser/inject/getUserId.js";
import startBrowser from "../browser/session/browserManager.js";
import logger from "../loggers/logger.js";
import { saveFollowers, saveFollowings } from "../storage/saveResults.mjs";
import { readFile } from "node:fs/promises";

export default async function runAnalysis(username) {
	logger.info(`Analysis started for username: ${username}`);

	const { browser, page } = await startBrowser();

	const _usernameId = await userId(page, username);

	//let followingsJson = await followings(page, userId)
	//let followersJson = await followers(page, userId)

    await connections(page, userId)

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
    const data = JSON.parse(await readFile("data/results/nicholasboidi_followings.json", "utf8"));

    const index = data.findIndex((item) => item.userId === "5915908737");
    console.log(index)

    console.log(data[index])
    let test = await page.evaluate(getMutualFollowers, data[index].userId)
    console.log(test.length)
    data[index]['mutualFollowers'] = test
    console.log(data[index])

    data.forEach(user => {
        
    });
}

async function closeBrowser(browser, page) {
	logger.info("Process finished... Closing the browser");
	await page.close();
	await browser.close();
}
