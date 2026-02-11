import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

export function registerCategoryTools(server: McpServer) {
  server.registerTool(
    "list_categories",
    {
      description: "List all categories",
    },
    async () => {
      const response = await api.get("/categories");
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "get_category",
    {
      description: "Get details of a specific category",
      inputSchema: { id: z.string().describe("Category ID") },
    },
    async ({ id }) => {
      const response = await api.get(`/categories/${id}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "create_category",
    {
      description: "Create a new category",
      inputSchema: {
        name: z.string().describe("Category name"),
        parent_id: z.number().optional().describe("Parent category ID"),
        color: z.string().optional().describe("Hex color code"),
      },
    },
    async (args) => {
      const response = await api.post("/categories", args);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "update_category",
    {
      description: "Update a category",
      inputSchema: {
        id: z.string().describe("Category ID"),
        name: z.string().optional().describe("New category name"),
        parent_id: z.number().nullable().optional().describe("New parent ID"),
      },
    },
    async ({ id, ...data }) => {
      const response = await api.put(`/categories/${id}`, data);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "delete_category",
    {
      description: "Delete a category",
      inputSchema: {
        id: z.string().describe("Category ID"),
        replacement_id: z
          .number()
          .int()
          .optional()
          .describe(
            "ID of category to replace this one in existing transactions",
          ),
      },
    },
    async ({ id, replacement_id }) => {
      const response = await api.delete(`/categories/${id}`, {
        data: { replacement_id },
      });
      return formatResponse(response.data);
    },
  );
}
