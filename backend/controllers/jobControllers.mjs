import { runJob } from '../services/jobServices.mjs';

export async function createJob(req, res, next) {
    try {
        const result = await runJob(req.body);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
