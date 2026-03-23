import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function saveResults({ username, result }) {
    const outputDir = path.resolve('data/results');
    await mkdir(outputDir, { recursive: true });

    const filePath = path.resolve(outputDir, `${username}.json`);
    const json = JSON.stringify(result, null, 2);

    await writeFile(filePath, json, 'utf8');

    return filePath;
}

export async function saveFollowers(username, result) {
    const outputDir = path.resolve('data/results');
    await mkdir(outputDir, { recursive: true });

    const filePath = path.resolve(outputDir, `${username}_followers.json`);
    const json = JSON.stringify(result, null, 2);

    await writeFile(filePath, json, 'utf8');

    return filePath;
}

export async function saveFollowings(username, result) {
    const outputDir = path.resolve('data/results');
    await mkdir(outputDir, { recursive: true });

    const filePath = path.resolve(outputDir, `${username}_followings.json`);
    const json = JSON.stringify(result, null, 2);

    await writeFile(filePath, json, 'utf8');

    return filePath;
}
