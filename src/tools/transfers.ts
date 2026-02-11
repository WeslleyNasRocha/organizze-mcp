import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

export function registerTransferTools(server: McpServer) {
  server.registerTool(
    "list_transfers",
    {
      description: "List all transfers",
      inputSchema: {
        start_date: z.string().optional().describe("Format: YYYY-MM-DD"),
        end_date: z.string().optional().describe("Format: YYYY-MM-DD"),
      },
    },
    async (args) => {
      const params = new URLSearchParams();
      if (args.start_date) params.append("start_date", args.start_date);
      if (args.end_date) params.append("end_date", args.end_date);

      const response = await api.get(`/transfers?${params.toString()}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "get_transfer",
    {
      description: "Get details of a specific transfer",
      inputSchema: { id: z.string().describe("Transfer ID") },
    },
    async ({ id }) => {
      const response = await api.get(`/transfers/${id}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "create_transfer",
    {
      description: "Create a new transfer between bank accounts",
      inputSchema: {
        credit_account_id: z.number().int().describe("Destination account ID"),
        debit_account_id: z.number().int().describe("Source account ID"),
        amount_cents: z.number().int().describe("Amount in cents"),
        date: z.string().describe("Date YYYY-MM-DD"),
        description: z.string().optional().describe("Transfer description"),
        paid: z.boolean().optional().describe("Whether it's already paid"),
        notes: z.string().optional().describe("Additional notes"),
        tags: z
          .array(z.object({ name: z.string() }))
          .optional()
          .describe("Array of tags. Example: [{name: 'tag'}]"),
      },
    },
    async (args) => {
      const response = await api.post("/transfers", args);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "update_transfer",
    {
      description: "Update a transfer",
      inputSchema: {
        id: z.string().describe("Transfer ID"),
        description: z.string().optional().describe("New description"),
        notes: z.string().optional().describe("New notes"),
        tags: z
          .array(z.object({ name: z.string() }))
          .optional()
          .describe("New tags"),
      },
    },
    async ({ id, ...data }) => {
      const response = await api.put(`/transfers/${id}`, data);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "delete_transfer",
    {
      description: "Delete a transfer",
      inputSchema: { id: z.string().describe("Transfer ID") },
    },
    async ({ id }) => {
      const response = await api.delete(`/transfers/${id}`);
      return formatResponse(response.data);
    },
  );
}
