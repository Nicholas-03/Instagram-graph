import pino from "pino";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function resolvePrettyTransport() {
	try {
		require.resolve("pino-pretty");
		return {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
				ignore: "pid,hostname",
			},
		};
	} catch {
		return undefined;
	}
}

const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	transport: resolvePrettyTransport(),
});

export default logger;
