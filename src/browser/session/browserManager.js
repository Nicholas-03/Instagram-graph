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
	if (!IG_USERNAME || !IG_PASSWORD) {
		throw new Error(
			"Instagram login requires IG_USERNAME and IG_PASSWORD when the saved browser profile is not authenticated",
		);
	}

	await clickVisibleControlByText(page, "allow all cookies", 5000).catch(
		() => null,
	);

	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Login
	const usernameSelector = 'input[name="username"], input[name="email"]';

	await page.waitForSelector(usernameSelector, {
		visible: true,
		timeout: 30000,
	});
	await page.waitForSelector('input[type="password"]', {
		visible: true,
		timeout: 30000,
	});

	await page.click(usernameSelector, { clickCount: 3 });
	await page.type(usernameSelector, IG_USERNAME, { delay: 80 });

	await page.click('input[type="password"]', { clickCount: 3 });
	await page.type('input[type="password"]', IG_PASSWORD, { delay: 80 });

	await waitForVisibleControlByText(page, "log in", 30000);

	await Promise.all([
		clickVisibleControlByText(page, "log in", 30000),
		page
			.waitForNavigation({
				waitUntil: "domcontentloaded",
				timeout: 30000,
			})
			.catch(() => null),
	]);

	_isLogged = true;
}

async function waitForVisibleControlByText(page, text, timeout) {
	await page.waitForFunction(
		(expectedText) => {
			const normalizedExpectedText = expectedText.trim().toLowerCase();
			const controls = document.querySelectorAll(
				'button, div[role="button"], a[role="button"], input[type="submit"]',
			);

			return Array.from(controls).some((control) => {
				const text = (
					control.getAttribute("aria-label") ||
					control.value ||
					control.textContent ||
					""
				)
					.trim()
					.toLowerCase();
				const isVisible = Boolean(
					control.offsetWidth ||
						control.offsetHeight ||
						control.getClientRects().length,
				);

				return isVisible && text === normalizedExpectedText;
			});
		},
		{ timeout },
		text,
	);
}

async function clickVisibleControlByText(page, text, timeout) {
	await waitForVisibleControlByText(page, text, timeout);
	await page.evaluate((expectedText) => {
		const normalizedExpectedText = expectedText.trim().toLowerCase();
		const controls = document.querySelectorAll(
			'button, div[role="button"], a[role="button"], input[type="submit"]',
		);
		const control = Array.from(controls).find((control) => {
			const text = (
				control.getAttribute("aria-label") ||
				control.value ||
				control.textContent ||
				""
			)
				.trim()
				.toLowerCase();
			const isVisible = Boolean(
				control.offsetWidth ||
					control.offsetHeight ||
					control.getClientRects().length,
			);

			return isVisible && text === normalizedExpectedText;
		});

		if (!control) {
			throw new Error(`Unable to find visible control: ${expectedText}`);
		}

		control.click();
	}, text);
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
