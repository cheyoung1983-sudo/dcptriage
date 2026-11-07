// scripts/patch-next.cjs
const fs = require('fs');
const path = require('path');

const targets = [
  {
    path: path.join(__dirname, '../node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.js'),
    content: `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEGMENT_EXPLORER_SIMULATED_ERROR_MESSAGE = 'NEXT_DEVTOOLS_SIMULATED_ERROR';
exports.SegmentBoundaryTriggerNode = function SegmentBoundaryTriggerNode() { return null; };
exports.SegmentStateProvider = function SegmentStateProvider(props) { return props ? props.children : null; };
exports.SegmentViewNode = function SegmentViewNode() { return null; };
exports.SegmentViewStateNode = function SegmentViewStateNode() { return null; };
exports.useSegmentState = function useSegmentState() { return { boundaryType: null, setBoundaryType: function() {} }; };
`
  },
  {
    path: path.join(__dirname, '../node_modules/next/dist/esm/next-devtools/userspace/app/segment-explorer-node.js'),
    content: `export const SEGMENT_EXPLORER_SIMULATED_ERROR_MESSAGE = 'NEXT_DEVTOOLS_SIMULATED_ERROR';
export function SegmentBoundaryTriggerNode() { return null; }
export function SegmentStateProvider(props) { return props ? props.children : null; }
export function SegmentViewNode() { return null; }
export function SegmentViewStateNode() { return null; }
export function useSegmentState() { return { boundaryType: null, setBoundaryType: function() {} }; }
`
  }
];

let patchedCount = 0;
for (const target of targets) {
  try {
    if (fs.existsSync(target.path)) {
      fs.writeFileSync(target.path, target.content, 'utf8');
      console.log('[patch-next] Patched:', target.path);
      patchedCount++;
    }
  } catch (err) {
    console.error('[patch-next] Failed to patch:', target.path, err);
  }
}

// Patch entry-base.js (CJS and ESM) so that SegmentViewNode is not overridden in development
const entryBasePaths = [
  path.join(__dirname, '../node_modules/next/dist/server/app-render/entry-base.js'),
  path.join(__dirname, '../node_modules/next/dist/esm/server/app-render/entry-base.js')
];

for (const entryPath of entryBasePaths) {
  try {
    if (fs.existsSync(entryPath)) {
      let content = fs.readFileSync(entryPath, 'utf8');
      
      // Remove any existing patches
      content = content.replace(/(false &&\s*)+/g, '');
      
      if (content.includes("process.env.NODE_ENV === 'development'")) {
        content = content.replace(
          "process.env.NODE_ENV === 'development'",
          "false && process.env.NODE_ENV === 'development'"
        );
        fs.writeFileSync(entryPath, content, 'utf8');
        console.log('[patch-next] Patched entry-base:', entryPath);
        patchedCount++;
      }
    }
  } catch (err) {
    console.error('[patch-next] Failed to patch entry-base:', entryPath, err);
  }
}

// Ensure necessary dev/runtime manifests exist if .next directory is present
const nextDir = path.join(__dirname, '../.next');
const serverDir = path.join(nextDir, 'server');

try {
  if (fs.existsSync(nextDir)) {
    // 1. fallback-build-manifest.json
    const fallbackManifestPath = path.join(nextDir, 'fallback-build-manifest.json');
    if (!fs.existsSync(fallbackManifestPath)) {
      fs.writeFileSync(fallbackManifestPath, JSON.stringify({ pages: {} }), 'utf8');
      console.log('[patch-next] Created fallback-build-manifest.json');
    }

    // 2. routes-manifest.json
    const routesManifestPath = path.join(nextDir, 'routes-manifest.json');
    if (!fs.existsSync(routesManifestPath)) {
      const defaultRoutesManifest = {
        version: 3,
        pages404: true,
        caseSensitive: false,
        basePath: '',
        redirects: [],
        headers: [],
        dynamicRoutes: [],
        staticRoutes: [
          {
            page: '/',
            regex: '^/(?:/)?$',
            routeKeys: {},
            namedRegex: '^/(?:/)?$'
          }
        ],
        dataRoutes: [],
        rsc: {
          header: 'RSC',
          varyHeader: 'RSC, Next-Router-State-Tree, Next-Router-Prefetch'
        }
      };
      fs.writeFileSync(routesManifestPath, JSON.stringify(defaultRoutesManifest, null, 2), 'utf8');
      console.log('[patch-next] Created routes-manifest.json');
    }

    // 3. app-build-manifest.json
    const appBuildManifestPath = path.join(nextDir, 'app-build-manifest.json');
    if (!fs.existsSync(appBuildManifestPath)) {
      fs.writeFileSync(appBuildManifestPath, JSON.stringify({ pages: {} }), 'utf8');
      console.log('[patch-next] Created app-build-manifest.json');
    }

    // 4. server/app-paths-manifest.json
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true });
    }
    const appPathsManifestPath = path.join(serverDir, 'app-paths-manifest.json');
    if (!fs.existsSync(appPathsManifestPath)) {
      fs.writeFileSync(appPathsManifestPath, JSON.stringify({ '/page': 'app/page.js' }), 'utf8');
      console.log('[patch-next] Created server/app-paths-manifest.json');
    }
  }
} catch (err) {
  console.error('[patch-next] Failed to initialize manifest guards:', err);
}

console.log('[patch-next] Completed. ' + patchedCount + ' file(s) patched.');

