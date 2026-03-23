import runAnalysis from "../analysis/runAnalysis.mjs";

let username = process.env.IG_USERNAME

await runAnalysis(username);