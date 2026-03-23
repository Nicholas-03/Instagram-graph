import { getBrowserPage } from "../browser/browserManager.js";
import getFollowers from "../browser/inject/getFollowers.js";
import getMutualFollowers from "../browser/inject/getMutualFollowers.js";
import { getUserId } from "../browser/browserService.js";
import { randomUUID } from 'crypto'
import logger from '../loggers/logger.js'
import getUsernameId from "../browser/inject/getUserId.js";

export async function runJob({ username }) {
    logger.info(`Job started for username: ${username}`)

    let page = getBrowserPage()
    let userId = await page.evaluate(getUsernameId, username)
    let followers = await page.evaluate(getFollowers, userId)
    logger.info(followers)
}