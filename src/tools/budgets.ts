import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

export function registerBudgetTools(server: McpServer) {
  server.registerTool(
    "list_budgets",
    {
      description: "List budgets (metas) for a period",
      inputSchema: {
        year: z.string().optional().describe("Year in YYYY format"),
        month: z.string().optional().describe("Month in MM format"),
      },
    },
    async ({ year, month }) => {
      let url = "/budgets";
      if (year) {
        url += `/${year}`;
        if (month) url += `/${month}`;
      }
      const response = await api.get(url);
      return formatResponse(response.data);
    },
  );
}
