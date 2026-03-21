import logger from "../loggers/logger.js";
import { startBrowser, getBrowserPage, isLoggedIn } from "./browserManager.js";
import getUserId from "./inject/getUserId.js";

const IG_USERNAME = process.env.IG_USERNAME

await startBrowser()

if (isLoggedIn()) {
    let page = getBrowserPage()

    let userId = await page.evaluate(getUserId, IG_USERNAME)
    logger.info(`User ID retrieved: ${userId}`)
}