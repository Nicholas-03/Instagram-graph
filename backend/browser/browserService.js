import logger from "../loggers/logger.js";
import { startBrowser, getBrowserPage, isLoggedIn } from "./browserManager.js";

const IG_USERNAME = process.env.IG_USERNAME
let userId = ''

async function runBrowserService() {
    let page = await startBrowser()
}

userId = runBrowserService(IG_USERNAME)

export function getUserId() {
    return userId
}