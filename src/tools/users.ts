import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

export function registerUserTools(server: McpServer) {
  server.registerTool(
    "get_user",
    {
      description: "Get current user details",
      inputSchema: {
        id: z.string().describe("User ID"),
      },
    },
    async ({ id }) => {
      const response = await api.get(`/users/${id}`);
      return formatResponse(response.data);
    },
  );
}
