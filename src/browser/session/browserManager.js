import path from "node:path";
import puppeteer from "puppeteer";
import logger from "../../loggers/logger.js";

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

let page = null;
let _isLogged = false;

export default async function startBrowser() {
	const browser = await puppeteer.launch({
		headless: false,
		slowMo: 80,
		defaultViewport: null,
		userDataDir: path.resolve("data/chrome-profile"),
	});

	page = await browser.newPage();

	await page.goto("https://www.instagram.com/accounts/login/", {
		waitUntil: "domcontentloaded",
		timeout: 60000,
	});

	if (!(await isLoggedIn(page))) {
		await logInInstagram(page);
		logger.info("Login made succesfully");
	}

	return { browser, page };
}

async function logInInstagram(page) {
	const buttons = await page.$$("button");

	for (const button of buttons) {
		const text = await button.evaluate((el) =>
			el.textContent?.trim().toLowerCase(),
		);
		if (text === "allow all cookies") {
			await button.click();
			break;
		}
	}

	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Login
	await page.waitForSelector('input[name="email"]', {
		visible: true,
		timeout: 30000,
	});
	await page.waitForSelector('input[type="password"]', {
		visible: true,
		timeout: 30000,
	});

	await page.click('input[name="email"]', { clickCount: 3 });
	await page.type('input[name="email"]', IG_USERNAME, { delay: 80 });

	await page.click('input[type="password"]', { clickCount: 3 });
	await page.type('input[type="password"]', IG_PASSWORD, { delay: 80 });

	await page.waitForSelector('div[aria-label="Log in"][role="button"]', {
		visible: true,
		timeout: 30000,
	});

	await Promise.all([
		page.click('div[aria-label="Log in"][role="button"]'),
		page
			.waitForNavigation({
				waitUntil: "domcontentloaded",
				timeout: 30000,
			})
			.catch(() => null),
	]);

	_isLogged = true;
}

export async function isLoggedIn(page) {
	if (page.url().includes("/accounts/login/")) {
		return false;
	}

	try {
		await page.waitForSelector(
			'svg[aria-label="Home"], a[href="/accounts/edit/"]',
			{
				timeout: 5000,
			},
		);
		return true;
	} catch {
		return false;
	}
}

export function getBrowserPage() {
	return page;
}
