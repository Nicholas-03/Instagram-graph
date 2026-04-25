import path from "node:path";
import puppeteer from "puppeteer";
import logger from "../../loggers/logger.js";

const isCloudRuntime = Boolean(process.env.SHUB_JOBKEY);

let page = null;
let _isLogged = false;

export default async function startBrowser() {
	const IG_USERNAME = process.env.IG_USERNAME;
	const IG_PASSWORD = process.env.IG_PASSWORD;

	// Validate credentials are available
	if (!IG_USERNAME || !IG_PASSWORD) {
		throw new Error(
			`Missing Instagram credentials. IG_USERNAME: ${IG_USERNAME ? "set" : "missing"}, IG_PASSWORD: ${IG_PASSWORD ? "set" : "missing"}`,
		);
	}
	const browser = await puppeteer.launch({
		headless: isCloudRuntime ? "new" : false,
		slowMo: isCloudRuntime ? 0 : 80,
		defaultViewport: null,
		userDataDir: path.resolve("data/chrome-profile"),
		args: isCloudRuntime
			? ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
			: [],
	});

	page = await browser.newPage();

	await page.goto("https://www.instagram.com/accounts/login/", {
		waitUntil: "domcontentloaded",
		timeout: 60000,
	});

	if (!(await isLoggedIn(page))) {
		await logInInstagram(page, IG_USERNAME, IG_PASSWORD);
		logger.info("Login made succesfully");
	}

	return { browser, page };
}

async function logInInstagram(page, username, password) {
	logger.info("Starting Instagram login process");

	// Try to click "Allow all cookies" button if it exists
	try {
		const buttons = await page.$$("button");
		for (const button of buttons) {
			const text = await button.evaluate((el) =>
				el.textContent?.trim().toLowerCase(),
			);
			if (text === "allow all cookies") {
				logger.info("Found and clicking 'Allow all cookies' button");
				await button.click();
				break;
			}
		}
	} catch (err) {
		logger.warn("No 'Allow all cookies' button found, continuing");
	}

	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Wait for email input
	try {
		logger.info("Waiting for email input field...");
		await page.waitForSelector('input[name="email"]', {
			visible: true,
			timeout: 15000,
		});
		logger.info("Email input field found");
	} catch (err) {
		logger.error("Email input not found. Current URL: " + page.url());
		logger.error("Trying to take screenshot for debugging...");
		try {
			await page.screenshot({ path: "/tmp/login-error.png" });
			logger.info("Screenshot saved to /tmp/login-error.png");
		} catch (screenshotErr) {
			logger.warn("Could not take screenshot: " + screenshotErr.message);
		}
		throw err;
	}

	// Wait for password input
	try {
		logger.info("Waiting for password input field...");
		await page.waitForSelector('input[type="password"]', {
			visible: true,
			timeout: 15000,
		});
		logger.info("Password input field found");
	} catch (err) {
		logger.error("Password input not found. Current URL: " + page.url());
		throw err;
	}

	// Fill credentials
	logger.info("Filling email field...");
	await page.click('input[name="email"]', { clickCount: 3 });
	await page.type('input[name="email"]', username, { delay: 50 });

	logger.info("Filling password field...");
	await page.click('input[type="password"]', { clickCount: 3 });
	await page.type('input[type="password"]', password, { delay: 50 });

	// Try to find and click the login button (with multiple selector variants)
	const loginSelectors = [
		'div[aria-label="Log in"][role="button"]',
		'button:has-text("Log in")',
		'button[type="button"]:has-text("Log in")',
		'//button[contains(text(), "Log in")]',
	];

	let loginButtonFound = false;
	let lastError = null;

	for (const selector of loginSelectors) {
		try {
			logger.info(`Trying login button selector: ${selector}`);
			
			// Special handling for XPath selectors
			if (selector.startsWith("//")) {
				const [button] = await page.$x(selector);
				if (button) {
					logger.info("Found login button via XPath, clicking...");
					await button.click();
					loginButtonFound = true;
					break;
				}
			} else {
				// Try waiting with shorter timeout for each selector
				await page.waitForSelector(selector, {
					visible: true,
					timeout: 5000,
				});
				logger.info("Found login button with selector: " + selector);
				await page.click(selector);
				loginButtonFound = true;
				break;
			}
		} catch (err) {
			logger.warn(`Login button selector failed (${selector}): ${err.message}`);
			lastError = err;
			continue;
		}
	}

	if (!loginButtonFound) {
		logger.error("Could not find login button with any selector");
		logger.error("Page content (first 2000 chars): " + await page.content().then(c => c.substring(0, 2000)));
		throw lastError || new Error("Login button not found");
	}

	// Wait for navigation after clicking login
	logger.info("Waiting for page navigation after login...");
	await Promise.all([
		page
			.waitForNavigation({
				waitUntil: "domcontentloaded",
				timeout: 30000,
			})
			.catch((err) => {
				logger.warn("Navigation timeout, but continuing: " + err.message);
				return null;
			}),
	]);

	logger.info("Login process completed");
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
