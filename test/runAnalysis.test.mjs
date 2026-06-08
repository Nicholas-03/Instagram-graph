import assert from "node:assert/strict";
import test from "node:test";

process.env.LOG_LEVEL = "silent";

const { default: runAnalysis } = await import(
	"../src/analysis/runAnalysis.mjs"
);

test("runAnalysis refreshes followers/followings and fetches missing mutuals", async () => {
	const mutualFetches = [];
	let browserClosed = false;
	let pageCloseCalled = false;
	const saved = {};

	const followers = [
		{
			userId: "follower-1",
			nickname: "alice",
			name: "Alice",
		},
	];
	const followings = [
		{
			userId: "following-1",
			nickname: "bob",
			name: "Bob",
		},
		{
			userId: "following-2",
			nickname: "carol",
			name: "Carol",
		},
	];
	const existingMutuals = [
		{
			userId: "following-1",
			nickname: "old-bob",
			name: "Old Bob",
			mutualFollowers: [{ userId: "mutual-1", username: "dave" }],
		},
	];

	const result = await runAnalysis(" nicholasboidi ", {
		startBrowser: async () => ({
			browser: {
				close: async () => {
					browserClosed = true;
				},
			},
			page: {
				close: async () => {
					pageCloseCalled = true;
				},
			},
		}),
		getUserId: async () => "self-1",
		getFollowers: async () => followers,
		getFollowings: async () => followings,
		loadExistingMutuals: async () => existingMutuals,
		getMutualFollowers: async (_page, userId) => {
			mutualFetches.push(userId);
			return [{ userId: "mutual-2", username: "erin" }];
		},
		saveFollowers: async (username, value) => {
			saved.followers = { username, value };
		},
		saveFollowings: async (username, value) => {
			saved.followings = { username, value };
		},
		saveMutuals: async (username, value) => {
			saved.mutuals = { username, value: structuredClone(value) };
		},
		wait: async () => {},
		mutualFetchDelayMs: 0,
	});

	assert.equal(result.username, "nicholasboidi");
	assert.equal(result.userId, "self-1");
	assert.deepEqual(saved.followers, {
		username: "nicholasboidi",
		value: followers,
	});
	assert.deepEqual(saved.followings, {
		username: "nicholasboidi",
		value: followings,
	});
	assert.deepEqual(mutualFetches, ["following-2"]);
	assert.deepEqual(saved.mutuals, {
		username: "nicholasboidi",
		value: [
			{
				userId: "following-1",
				nickname: "bob",
				name: "Bob",
				mutualFollowers: [{ userId: "mutual-1", username: "dave" }],
			},
			{
				userId: "following-2",
				nickname: "carol",
				name: "Carol",
				mutualFollowers: [{ userId: "mutual-2", username: "erin" }],
			},
		],
	});
	assert.equal(browserClosed, true);
	assert.equal(pageCloseCalled, false);
});
