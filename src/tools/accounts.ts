import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

export function registerAccountTools(server: McpServer) {
  server.registerTool(
    "list_accounts",
    {
      description: "List all bank accounts",
    },
    async () => {
      const response = await api.get("/accounts");
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "get_account",
    {
      description: "Get details of a specific bank account",
      inputSchema: { id: z.string().describe("Account ID") },
    },
    async ({ id }) => {
      const response = await api.get(`/accounts/${id}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "create_account",
    {
      description: "Create a new bank account",
      inputSchema: {
        name: z.string().describe("Account name"),
        type: z.enum(["checking", "savings", "other"]).describe("Account type"),
        description: z.string().optional().describe("Account description"),
        default: z.boolean().optional().describe("Set as default account"),
      },
    },
    async (args) => {
      const response = await api.post("/accounts", args);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "update_account",
    {
      description: "Update a bank account",
      inputSchema: {
        id: z.string().describe("Account ID"),
        name: z.string().optional().describe("New account name"),
        description: z.string().optional().describe("New description"),
        default: z.boolean().optional().describe("Set as default"),
        archived: z.boolean().optional().describe("Archive/unarchive account"),
      },
    },
    async ({ id, ...data }) => {
      const response = await api.put(`/accounts/${id}`, data);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "delete_account",
    {
      description: "Delete a bank account",
      inputSchema: { id: z.string().describe("Account ID") },
    },
    async ({ id }) => {
      const response = await api.delete(`/accounts/${id}`);
      return formatResponse(response.data);
    },
  );
}
