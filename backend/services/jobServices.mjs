import { getBrowserPage } from "../browser/browserManager.js";
import getFollowers from "../browser/inject/getFollowers.js";
import getMutualFollowers from "../browser/inject/getMutualFollowers.js";
import { randomUUID } from 'crypto'
import logger from '../loggers/logger.js'

export async function runJob({ username }) {
    logger.info(`Job started for username: ${username}`)

    return { "id": randomUUID() }
}