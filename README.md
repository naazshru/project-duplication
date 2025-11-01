# StoryFlow Studio

StoryFlow Studio lets you transform image sequences into polished slideshow-style videos directly in the browser. Upload imagery, layer custom audio, experiment with filters, and author subtitles before exporting recordings with your favorite screen capture or browser-based video tools.

## Getting started

```bash
npm install
```

### Run tests

```bash
npm test
```

## Build for publication

Generate a deployable `dist` folder that can be uploaded to any static host (Netlify, GitHub Pages, S3, etc.).

```bash
npm run build
```

### Preview the production bundle locally

After building, serve the optimized output from `dist/` with a lightweight static server. The preview server defaults to port `4173`.

```bash
npm run preview
```

You can override the port by providing a `PORT` environment variable:

```bash
PORT=5000 npm run preview
```

Once satisfied, deploy the contents of `dist/` to your hosting provider of choice.
