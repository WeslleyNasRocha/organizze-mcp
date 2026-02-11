import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { z } from "zod";

// Bun automatically loads .env files, so we don't need the 'dotenv' package.
// External 'dotenv' package can pollute stdout which breaks MCP protocol.

const ORGANIZZE_EMAIL = process.env.ORGANIZZE_EMAIL;
const ORGANIZZE_TOKEN = process.env.ORGANIZZE_TOKEN;
const ORGANIZZE_NAME = process.env.ORGANIZZE_NAME;

if (!ORGANIZZE_EMAIL || !ORGANIZZE_TOKEN || !ORGANIZZE_NAME) {
  // Use console.error for logging - this goes to stderr and doesn't break MCP.
  console.error(
    "Error: ORGANIZZE_EMAIL, ORGANIZZE_TOKEN and ORGANIZZE_NAME must be set.",
  );
  process.exit(1);
}

const api = axios.create({
  baseURL: "https://api.organizze.com.br/rest/v2",
  auth: {
    username: ORGANIZZE_EMAIL,
    password: ORGANIZZE_TOKEN,
  },
  headers: {
    "User-Agent": `${ORGANIZZE_NAME} (${ORGANIZZE_EMAIL})`,
    "Content-Type": "application/json",
  },
});

const server = new McpServer({
  name: "organizze-mcp",
  version: "1.0.0",
});

// User tool
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
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

// Account tools
server.registerTool(
  "list_accounts",
  {
    description: "List all bank accounts",
  },
  async () => {
    const response = await api.get("/accounts");
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
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
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "create_account",
  {
    description: "Create a new bank account",
    inputSchema: {
      name: z.string(),
      type: z.enum(["checking", "savings", "other"]),
      description: z.string().optional(),
      default: z.boolean().optional(),
    },
  },
  async (args) => {
    const response = await api.post("/accounts", args);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "update_account",
  {
    description: "Update a bank account",
    inputSchema: {
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      default: z.boolean().optional(),
      archived: z.boolean().optional(),
    },
  },
  async ({ id, ...data }) => {
    const response = await api.put(`/accounts/${id}`, data);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "delete_account",
  {
    description: "Delete a bank account",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const response = await api.delete(`/accounts/${id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

// Category tools
server.registerTool(
  "list_categories",
  {
    description: "List all categories",
  },
  async () => {
    const response = await api.get("/categories");
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "get_category",
  {
    description: "Get details of a specific category",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const response = await api.get(`/categories/${id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "create_category",
  {
    description: "Create a new category",
    inputSchema: {
      name: z.string(),
      parent_id: z.number().optional(),
      color: z.string().optional(),
    },
  },
  async (args) => {
    const response = await api.post("/categories", args);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "update_category",
  {
    description: "Update a category",
    inputSchema: {
      id: z.string(),
      name: z.string().optional(),
      parent_id: z.number().nullable().optional(),
    },
  },
  async ({ id, ...data }) => {
    const response = await api.put(`/categories/${id}`, data);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "delete_category",
  {
    description: "Delete a category",
    inputSchema: {
      id: z.string(),
      replacement_id: z
        .number()
        .int()
        .optional()
        .describe("ID of category to replace this one"),
    },
  },
  async ({ id, replacement_id }) => {
    const response = await api.delete(`/categories/${id}`, {
      data: { replacement_id },
    });
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

// Credit Card tools
server.registerTool(
  "list_credit_cards",
  {
    description: "List all credit cards",
  },
  async () => {
    const response = await api.get("/credit_cards");
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "get_credit_card",
  {
    description: "Get details of a specific credit card",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const response = await api.get(`/credit_cards/${id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "list_invoices",
  {
    description: "List invoices for a credit card",
    inputSchema: { credit_card_id: z.string() },
  },
  async ({ credit_card_id }) => {
    const response = await api.get(`/credit_cards/${credit_card_id}/invoices`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

// Budget tools
server.registerTool(
  "list_budgets",
  {
    description: "List budgets (metas) for a period",
    inputSchema: {
      year: z.string().optional(),
      month: z.string().optional(),
    },
  },
  async ({ year, month }) => {
    let url = "/budgets";
    if (year) {
      url += `/${year}`;
      if (month) url += `/${month}`;
    }
    const response = await api.get(url);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

// Transaction tools
server.registerTool(
  "list_transactions",
  {
    description: "List transactions with optional filters",
    inputSchema: {
      start_date: z.string().optional().describe("Format: YYYY-MM-DD"),
      end_date: z.string().optional().describe("Format: YYYY-MM-DD"),
      account_id: z.string().optional(),
      category_id: z.string().optional(),
      credit_card_id: z.string().optional(),
    },
  },
  async (args) => {
    const params = new URLSearchParams();
    if (args.start_date) params.append("start_date", args.start_date);
    if (args.end_date) params.append("end_date", args.end_date);
    if (args.account_id) params.append("account_id", args.account_id);
    if (args.category_id) params.append("category_id", args.category_id);
    if (args.credit_card_id)
      params.append("credit_card_id", args.credit_card_id);

    const response = await api.get(`/transactions?${params.toString()}`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "create_transaction",
  {
    description: "Create a new transaction (movimentação)",
    inputSchema: {
      description: z.string(),
      date: z.string().describe("YYYY-MM-DD"),
      amount_cents: z.number(),
      category_id: z.number().int(),
      account_id: z.number().int().optional(),
      credit_card_id: z.number().int().optional(),
      notes: z.string().optional(),
      status: z.number().int().optional().describe("0 for pending, 1 for paid"),
      recurring: z.boolean().optional(),
      installments: z.boolean().optional(),
      total_installments: z.number().int().optional(),
      installments_attributes: z
        .object({
          total: z.number().int(),
          periodicity: z.enum([
            "monthly",
            "yearly",
            "weekly",
            "biweekly",
            "bimonthly",
            "trimonthly",
          ]),
        })
        .optional(),
      recurrence_attributes: z
        .object({
          periodicity: z.enum([
            "monthly",
            "yearly",
            "weekly",
            "biweekly",
            "bimonthly",
            "trimonthly",
          ]),
        })
        .optional(),
    },
  },
  async (args) => {
    const response = await api.post("/transactions", args);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "get_transaction",
  {
    description: "Get details of a specific transaction",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const response = await api.get(`/transactions/${id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "update_transaction",
  {
    description: "Update a transaction",
    inputSchema: {
      id: z.string(),
      description: z.string().optional(),
      date: z.string().optional(),
      amount_cents: z.number().optional(),
      category_id: z.number().int().optional(),
      account_id: z.number().int().optional(),
      notes: z.string().optional(),
      status: z.number().int().optional(),
    },
  },
  async ({ id, ...data }) => {
    const response = await api.put(`/transactions/${id}`, data);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "delete_transaction",
  {
    description: "Delete a transaction",
    inputSchema: { id: z.string() },
  },
  async ({ id }) => {
    const response = await api.delete(`/transactions/${id}`);
    return {
      content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
    };
  },
);

server.registerTool(
  "create_bulk_transactions",
  {
    description: "Create multiple transactions in one call",
    inputSchema: {
      transactions: z.array(
        z.object({
          description: z.string(),
          date: z.string().describe("YYYY-MM-DD"),
          amount_cents: z.number(),
          category_id: z.number().int(),
          account_id: z.number().int().optional(),
          credit_card_id: z.number().int().optional(),
          notes: z.string().optional(),
          status: z
            .number()
            .int()
            .optional()
            .describe("0 for pending, 1 for paid"),
          recurring: z.boolean().optional(),
          installments: z.boolean().optional(),
          total_installments: z.number().int().optional(),
          installments_attributes: z
            .object({
              total: z.number().int(),
              periodicity: z.enum([
                "monthly",
                "yearly",
                "weekly",
                "biweekly",
                "bimonthly",
                "trimonthly",
              ]),
            })
            .optional(),
          recurrence_attributes: z
            .object({
              periodicity: z.enum([
                "monthly",
                "yearly",
                "weekly",
                "biweekly",
                "bimonthly",
                "trimonthly",
              ]),
            })
            .optional(),
        }),
      ),
    },
  },
  async ({ transactions }) => {
    const results = [];
    for (const t of transactions) {
      try {
        const response = await api.post("/transactions", t);
        results.push(response.data);
      } catch (err: any) {
        results.push({
          error: err.response?.data || err.message,
          data: t,
        });
      }
    }
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  },
);

server.registerTool(
  "delete_bulk_transactions",
  {
    description: "Delete multiple transactions in one call",
    inputSchema: {
      ids: z.array(z.string()),
    },
  },
  async ({ ids }) => {
    const results = [];
    for (const id of ids) {
      try {
        await api.delete(`/transactions/${id}`);
        results.push({ id, status: "deleted" });
      } catch (err: any) {
        results.push({
          id,
          error: err.response?.data || err.message,
        });
      }
    }
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  },
);

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  // Use console.error for logging - this goes to stderr and doesn't break MCP.
  console.error("Fatal error running server:", error);
  process.exit(1);
});
