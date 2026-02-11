#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools, server } from "./src/server.js";

// Register all tools
registerAllTools();

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  // Use console.error for logging - this goes to stderr and doesn't break MCP.
  console.error("Fatal error running server:", error);
  process.exit(1);
});
