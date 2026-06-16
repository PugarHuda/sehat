// Electron Forge config — packages Sehat into a native desktop app.
// The @qvac/sdk plugin bundles the on-device worker + native addons (and prunes
// the ones we don't use, per qvac.config.json) so models run inside the package.
const QvacForgePlugin = require("@qvac/sdk/electron-forge");

module.exports = {
  packagerConfig: {
    name: "Sehat",
    executableName: "Sehat",
    // Build the package directly in ./out instead of extracting to a temp template
    // and moving it — avoids a silent finalize/move failure on this Windows host.
    tmpdir: false,
    // asar is forced off by the QVAC plugin (the Bare worker can't load from asar).
    // Ship only what the app needs; everything else is excluded.
    ignore: [
      /^\/out\//,
      /^\/assets\//,
      /^\/docs\//,
      /^\/artifacts\//,
      /^\/certs\//,
      /^\/\.git/,
      /^\/data\/records\//, // runtime data — created fresh per install
      /^\/data\/images\//,  // demo source images (large); sample .txt still ships
      /\.md$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    // Per-user installer (.exe) — installs to %LocalAppData% (user-writable, so
    // Sehat's local record storage works without admin rights).
    {
      name: "@electron-forge/maker-squirrel",
      config: { name: "Sehat", setupExe: "Sehat-Setup.exe" },
    },
    // Portable zip fallback.
    { name: "@electron-forge/maker-zip", platforms: ["win32"] },
  ],
  plugins: [
    new QvacForgePlugin({ hosts: ["win32-x64"], logLevel: "info" }),
  ],
};
