import pkg from "pg";
const { Pool } = pkg;

import { createTunnel } from "tunnel-ssh";
import { readFileSync } from "fs";
import process from "process";

import config from "../config/index.js";

let pool;

export async function setupTunnel(startPort, targetHost, targetPort) {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      // Find an available port dynamically for this process
      const localPort = startPort;

      const tunnelOptions = {
        autoClose: true,
      };

      const serverOptions = {
        host: "127.0.0.1",
        port: localPort,
      };

      const sshOptions = {
        host: config.sshHost,
        port: config.sshPort,
        username: config.sshUser,
        privateKey: readFileSync(config.sshKeyPath),
      };

      const forwardOptions = {
        srcAddr: "127.0.0.1",
        srcPort: localPort,
        dstAddr: targetHost,
        dstPort: targetPort,
      };

      console.log(`Setting up SSH tunnel on local port ${localPort}...`);

      await createTunnel(
        tunnelOptions,
        serverOptions,
        sshOptions,
        forwardOptions
      );

      console.log(`SSH tunnel established successfully on port ${localPort}`);
      return localPort;
    } catch (err) {
      attempts++;

      if (err.code === "EADDRINUSE" && attempts < maxAttempts) {
        console.log(`Port conflict detected, trying next available port...`);
        startPort = startPort + 1;
        continue;
      }

      console.error(`Failed to establish SSH tunnel:`, err);
      process.exit(1);
    }
  }

  console.error(`Failed to establish SSH tunnel after ${maxAttempts} attempts`);
  process.exit(1);
}

export async function initDB() {
  const connectionConfig = {
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
  };

  if (config.appEnv === "local") {
    connectionConfig.host = "127.0.0.1";
    const localPort = await setupTunnel(5432, config.dbHost, config.dbPort);
    connectionConfig.port = localPort; // Use the local port from the tunnel
  }

  console.log("Connecting to database...");
  try {
    pool = new Pool(connectionConfig);
    await pool.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

export function getDB() {
  if (!pool) {
    throw new Error("Database connection not initialized");
  }
  return pool;
}
