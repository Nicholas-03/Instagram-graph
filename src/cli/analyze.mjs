import runAnalysis from "../analysis/runAnalysis.mjs";

const username = process.env.IG_USERNAME;

await runAnalysis(username);
