import logger from "../loggers/logger.js";
import { startBrowser, getBrowserPage, isLoggedIn } from "./browserManager.js";
import getUsernameId from "./inject/getUserId.js";

const IG_USERNAME = process.env.IG_USERNAME
let userId = ''

async function runBrowserService(username) {
    let page = await startBrowser()
    
    if (isLoggedIn(page)) {    
        userId = await page.evaluate(getUsernameId, username)
        logger.info(`User ID retrieved: ${userId}`)

        return userId
    }

    return logger.error('Not logged in')
}

userId = runBrowserService(IG_USERNAME)

export function getUserId() {
    return userId
}