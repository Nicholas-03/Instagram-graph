import puppeteer from "puppeteer";
import fs from "fs";

const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

let page = null
let isLogged = false

export async function startBrowser() {
	const browser = await puppeteer.launch({
		headless: false,
		slowMo: 80,
		defaultViewport: null,
	});

	page = await browser.newPage();

	await page.goto("https://www.instagram.com/accounts/login/", {
		waitUntil: "domcontentloaded",
		timeout: 60000,
	});

	const buttons = await page.$$('button');

	for (const button of buttons) {
		const text = await button.evaluate(el => el.textContent?.trim().toLowerCase());
		if (text === 'allow all cookies') {
			await button.click();
			break;
		}
	}

	await new Promise(resolve => setTimeout(resolve, 2000));

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
		page.waitForNavigation({
			waitUntil: "domcontentloaded",
			timeout: 30000,
		}).catch(() => null),
	]);

	isLogged = true
}

export function getBrowserPage() {
	return page
}

export function isLoggedIn() {
	return isLogged
}
