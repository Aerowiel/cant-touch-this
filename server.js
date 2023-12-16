import * as fs from "node:fs";
import chokidar from "chokidar";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import { createServer } from "node:http";
import { Server } from "socket.io";

installGlobals();

/**
 * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
 */
const BUILD_PATH = "./build/index.js";

/**
 * Initial build
 * @type {ServerBuild}
 */
let build = await import(BUILD_PATH);

const app = express();

app.use(compression());
// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");
// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);
// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler()
    : createRequestHandler({ build, mode: process.env.NODE_ENV })
);

const port = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer);

let numberOfPlayers = 0;
let players = {};

io.on("connection", (socket) => {
  const ip = String(
    socket.handshake.headers["x-forwarded-for"] ||
      socket.conn.remoteAddress.split(":")[3]
  );

  numberOfPlayers += 1;
  if (players[ip]) {
    players[ip] += 1;
  } else {
    players[ip] = 1;
  }

  console.log(`Unique players : ${Object.keys(players).length}`);

  io.emit("update-number-of-players", { numberOfPlayers });

  socket.on("disconnect", () => {
    numberOfPlayers -= 1;
    if (players[ip]) {
      players[ip] -= 1;
      if (players[ip] === 0) {
        delete players[ip];
      }
    }

    console.log(`Unique players : ${Object.keys(players).length}`);

    io.emit("update-number-of-players", { numberOfPlayers });
  });
});

httpServer.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  // send "ready" message to dev server
  if (process.env.NODE_ENV === "development") {
    broadcastDevReady(build);
  }
});

// Create a request handler that watches for changes to the server build during development.
function createDevRequestHandler() {
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer();
    // 2. tell dev server that this app server is now up-to-date and ready
    broadcastDevReady(build);
  }

  chokidar
    .watch(BUILD_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// ESM import cache busting
/**
 * @type {() => Promise<ServerBuild>}
 */
async function reimportServer() {
  const stat = fs.statSync(BUILD_PATH);

  // use a timestamp query parameter to bust the import cache
  return import(BUILD_PATH + "?t=" + stat.mtimeMs);
}
