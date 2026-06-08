# Instagram Graph

Analyze an Instagram account's followers/followings and visualize the network as an interactive Cytoscape graph.

## Requirements

- Node.js 20+
- npm
- An Instagram account/session usable by Puppeteer

## Setup

```bash
npm install
npm run browsers:install
```

Create `.env` in the project root:

```env
IG_USERNAME=your_instagram_username
IG_PASSWORD=your_instagram_password
```

`IG_PASSWORD` is only needed when `data/chrome-profile` is not already logged in.

## Fetch Latest Data

```bash
npm run start
```

This writes:

- `data/results/<username>_followers.json`
- `data/results/<username>_followings.json`
- `data/results/<username>_mutuals.json`

Mutual follower fetching resumes from existing saved data when possible.

## Visualize

Build graph edges:

```bash
node src/graph/buildEdges.mjs
```

Start the graph server:

```bash
npm run graph
```

Open:

```text
http://localhost:5173
```

The graph uses profile images through a local image proxy and places users with no edges around the graph instead of in the dense center.

## Useful Commands

```bash
npm test       # run Node tests
npm run fix    # format/lint with Biome
npm run dev    # rerun scraper on file changes
```

## Notes

- Keep `.env` and `data/chrome-profile` private.
- Re-run `node src/graph/buildEdges.mjs` after fetching fresh data.
- If Puppeteer cannot find Chrome, run `npm run browsers:install`.
