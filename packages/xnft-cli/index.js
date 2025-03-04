#!/usr/bin/env node

// using JS for now because there are race-condition issues
// with compiling typescript before running in the monorepo

const { Parcel } = require("@parcel/core");
const { program } = require("commander");
const { join, resolve } = require("path");

const { SIMULATOR_PORT } = { SIMULATOR_PORT: 9933 }; // TODO: replace with import.

const options = {
  entries: "./src/index.tsx",
  defaultConfig: "@parcel/config-default",
  defaultTargetOptions: {
    engines: {
      browsers: ["last 1 Chrome version"],
    },
  },
  targets: {
    modern: {
      distDir: "dist",
    },
  },
  additionalReporters: [
    {
      packageName: "@parcel/reporter-cli",
      resolveFrom: __filename,
    },
  ],
};

program.command("build").action(async () => {
  // https://parceljs.org/features/parcel-api/#building
  const bundler = new Parcel({
    ...options,
    mode: "production",
    sourceMap: false,
    optimize: true,
  });

  try {
    const { buildTime } = await bundler.run();
    console.debug(`✨ built in ${buildTime}ms!`);
  } catch (err) {
    console.error(err.diagnostics);
  }
});

program.command("watch").action(async () => {
  console.debug(`👀 watching ${resolve()}`);
  // https://parceljs.org/features/parcel-api/#watching
  const bundler = new Parcel({
    ...options,
    mode: "development",
    sourceMap: true,
    optimize: false,
  });
  await bundler.watch();
});

program
  .command("dev")
  .option(
    "-i, --iframe <string>",
    "a URL to load inside an iframe xNFT in the simulator",
    (url) => new URL(url)?.href
  )
  .action(async ({ iframe }) => {
    console.debug(`👀 watching ${resolve()}`);

    const express = require("express");
    const fs = require("fs");
    const app = express();

    const port = SIMULATOR_PORT;

    let js;
    let rendererScript;

    try {
      const rendererFileContent = fs.readFileSync(
        join(__dirname, "renderer.js"),
        {
          encoding: "utf-8",
        }
      );
      rendererScript = `<script>${rendererFileContent}</script>`;
    } catch (e) {
      console.log("falling back to latest renderer");
      // fallback to latest version of renderer
      rendererScript = `<script src="https://unpkg.com/@coral-xyz/react-xnft-dom-renderer@0.1.0-latest.45/dist/index.js"></script>`;
    }
    if (iframe) {
      // If an iframe URL has been provided then serve the iframe xNFT example,
      // but replace the source URL with the provided one
      js = fs
        .readFileSync(join(__dirname, "iframe.js"), {
          encoding: "utf-8",
        })
        .replace(
          "https://coral-xyz.github.io/backpack/iframe-example.html",
          iframe
        );
    } else {
      // https://parceljs.org/features/parcel-api/#watching
      const bundler = new Parcel({
        ...options,
        mode: "development",
        sourceMap: true,
        optimize: false,
      });

      if (!fs.existsSync("dist/index.js")) {
        if (!fs.existsSync("dist")) {
          fs.mkdirSync("dist");
        }
        fs.writeFileSync("dist/index.js", "");
      }

      js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
      await bundler.watch((err, buildEvent) => {
        console.log("build changed");
        if (err) {
          console.error("build error", JSON.stringify(err));
        }
        if (buildEvent.type === "buildFailure") {
          console.error("build error", JSON.stringify(buildEvent));
        }
        js = fs.readFileSync("dist/index.js", { encoding: "utf-8" });
      });
    }

    app.get("/", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <link rel="stylesheet" href="https://doof72pbjabye.cloudfront.net/fonts/inter/font.css"></link>
          </head>
          <title>simulator</title>
          <body>
            <div id="container"></div>
            <script>${js}</script>
            ${rendererScript}
          </body>
        </html>
      `);
    });

    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

program.parse();

program
  .command("init")
  .argument("<name>", "name of the xnft")
  .action(async (name) => {
    const download = require("download-git-repo");

    await download("coral-xyz/xnft-quickstart", `${name}/`, function (err) {});

    console.debug(`${name} initalized`);
    console.debug(``);
    console.debug(`run these commands:`);
    console.debug(`cd ${name}`);
    console.debug(`yarn && yarn dev`);
  });
