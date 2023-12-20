import express from "express";
import http from "http";
import socketIO from "socket.io";
// const socketIO = require("socket.io");
// const { Server } = require("socket.io");
import ioClient from "socket.io-client";
import sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

// Setup express server and socket.io for backend server
const app = express();
const server = http.createServer(app);
const io = new socketIO(server);

// SQLite database setup
const db = new sqlite3.Database(
  "./data.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to SQLite database.");
      db.run(
        "CREATE TABLE IF NOT EXISTS data_points (subNum INTEGER, lat REAL, lng REAL, seconds INTEGER, howMany INTEGER, obsCount INTEGER, createTime DATETIME DEFAULT CURRENT_TIMESTAMP)"
      );
    }
  }
);
// A function that returns a promise which resolves to the query result
function getHistoricData(db, dateRange) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM data_points WHERE createTime >= ?",
      dateRange,
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

// Connect to the 3rd party socket server
const thirdPartyUrl = "https://livesubs.ornith.cornell.edu";
const socket = ioClient.connect(thirdPartyUrl, {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to third-party socket server");
});

socket.on("newsubs", async (e) => {
  const data = JSON.parse(e);
  // Store new data in SQLite

  const oneDayAgo = new Date(
    new Date().getTime() - 24 * 3600 * 1000
  ).toISOString();
  const oldData = await getHistoricData(db, oneDayAgo);
  (data || []).map((el) => {
    const stmt = db.prepare(
      "INSERT INTO data_points (subNum, lat, lng, seconds, howMany, obsCount) VALUES (?, ?, ?, ?, ?, ?)"
    );
    stmt.run(el.subNum, el.lat, el.lng, el.seconds, el.howMany, el.obsCount);
    stmt.finalize();
  });
  // Emit new data to subscribers
  io.emit("new-data", {
    newData: data,
    oldData: oldData,
  });
});

// Serve last hour's data to new subscribers
io.on("connection", async (socket) => {
  console.log("New client connected");
  const oneHourAgo = new Date(
    new Date().getTime() - 24 * 3600 * 1000
  ).toISOString();
  const data = await getHistoricData(db, oneHourAgo);
  socket.emit("historic-data", data);
});

// Clean up data older than one hour every 10 minutes
setInterval(() => {
  const oneDayAgo = new Date(
    new Date().getTime() - 24 * 3600 * 1000
  ).toISOString();
  db.run("DELETE FROM data_points WHERE createTime < ?", oneDayAgo, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Deleted data points older than one hour");
    }
  });
}, 10 * 60000);

// Start the express server listening on a specific port
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle server shutdown
process.on("SIGINT", () => {
  console.log("Shutting down the server gracefully...");

  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
  });

  server.close(() => {
    console.log("HTTP and WebSocket server closed.");
  });

  // End process after all resources are cleaned up
  process.exit(0);
});
