import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

const transactionSchema = z.object({
  description: z.string().describe("Transaction description"),
  date: z.string().describe("YYYY-MM-DD"),
  amount_cents: z.number().describe("Amount in cents (negative for expenses)"),
  category_id: z.number().int().describe("Category ID"),
  account_id: z.number().int().optional().describe("Account ID"),
  credit_card_id: z.number().int().optional().describe("Credit Card ID"),
  notes: z.string().optional().describe("Additional notes"),
  status: z.number().int().optional().describe("0 for pending, 1 for paid"),
  recurring: z
    .boolean()
    .optional()
    .describe("Whether it is recurring (managed by Organizze)"),
  installments: z
    .boolean()
    .optional()
    .describe("Whether it is part of installments"),
  total_installments: z
    .number()
    .int()
    .optional()
    .describe("Total number of installments"),
  tags: z
    .array(z.object({ name: z.string() }))
    .optional()
    .describe("Array of tags. Example: [{name: 'homeoffice'}]"),
  installments_attributes: z
    .object({
      total: z.number().int().describe("Total installments"),
      periodicity: z
        .enum([
          "monthly",
          "yearly",
          "weekly",
          "biweekly",
          "bimonthly",
          "trimonthly",
        ])
        .describe("Payment periodicity"),
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
});

export function registerTransactionTools(server: McpServer) {
  server.registerTool(
    "list_transactions",
    {
      description: "List transactions with optional filters",
      inputSchema: {
        start_date: z
          .string()
          .optional()
          .describe("Format: YYYY-MM-DD. Defaults to current month."),
        end_date: z
          .string()
          .optional()
          .describe("Format: YYYY-MM-DD. Defaults to current month."),
        account_id: z.string().optional().describe("Filter by account ID"),
        category_id: z.string().optional().describe("Filter by category ID"),
        credit_card_id: z
          .string()
          .optional()
          .describe("Filter by credit card ID"),
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
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "create_transaction",
    {
      description: "Create a new transaction (movimentação)",
      inputSchema: transactionSchema,
    },
    async (args) => {
      const response = await api.post("/transactions", args);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "get_transaction",
    {
      description: "Get details of a specific transaction",
      inputSchema: { id: z.string().describe("Transaction ID") },
    },
    async ({ id }) => {
      const response = await api.get(`/transactions/${id}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "update_transaction",
    {
      description: "Update a transaction",
      inputSchema: transactionSchema.partial().extend({
        id: z.string().describe("Transaction ID"),
        update_future: z
          .boolean()
          .optional()
          .describe(
            "Update this and all future occurrences (for recurring/installments)",
          ),
        update_all: z
          .boolean()
          .optional()
          .describe("Update all occurrences (past and future)"),
      }),
    },
    async ({ id, ...data }) => {
      const response = await api.put(`/transactions/${id}`, data);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "delete_transaction",
    {
      description: "Delete a transaction",
      inputSchema: {
        id: z.string().describe("Transaction ID"),
        update_future: z
          .boolean()
          .optional()
          .describe("Delete this and all future occurrences"),
        update_all: z.boolean().optional().describe("Delete all occurrences"),
      },
    },
    async ({ id, ...data }) => {
      const response = await api.delete(`/transactions/${id}`, { data });
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "create_bulk_transactions",
    {
      description:
        "Create multiple transactions in one call. Returns a summary of successes and failures.",
      inputSchema: {
        transactions: z.array(transactionSchema),
        fail_fast: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, stop processing after the first error."),
      },
    },
    async ({ transactions, fail_fast }) => {
      const successes = [];
      const failures = [];

      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i];
        if (!t) continue;
        try {
          const response = await api.post("/transactions", t);
          successes.push(response.data);
        } catch (err) {
          const errorDetail =
            (err as any).response?.data || (err as any).message;
          failures.push({
            index: i,
            description: t.description,
            error: errorDetail,
          });
          if (fail_fast) {
            const remaining = transactions.length - (i + 1);
            return formatResponse({
              status: "failed_fast",
              message: `Stopped at transaction ${i + 1}/${transactions.length} due to error.`,
              summary: {
                total: transactions.length,
                success_count: successes.length,
                failure_count: failures.length,
                remaining_count: remaining,
              },
              successes,
              failures,
            });
          }
        }
      }

      const total = transactions.length;
      const successCount = successes.length;
      const failureCount = failures.length;

      return formatResponse({
        status:
          failureCount === 0
            ? "success"
            : successCount === 0
              ? "failed"
              : "partial_success",
        summary: {
          total,
          success_count: successCount,
          failure_count: failureCount,
        },
        successes:
          successCount > 20
            ? `${successCount} transactions created successfully.`
            : successes,
        failures,
      });
    },
  );

  server.registerTool(
    "delete_bulk_transactions",
    {
      description:
        "Delete multiple transactions in one call. Returns a summary.",
      inputSchema: {
        ids: z.array(z.string()).describe("Array of transaction IDs to delete"),
        fail_fast: z
          .boolean()
          .optional()
          .default(false)
          .describe("If true, stop processing after the first error."),
      },
    },
    async ({ ids, fail_fast }) => {
      const successes = [];
      const failures = [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        try {
          await api.delete(`/transactions/${id}`);
          successes.push(id);
        } catch (err: any) {
          const errorDetail = err.response?.data || err.message;
          failures.push({ id, error: errorDetail });
          if (fail_fast) {
            const remaining = ids.length - (i + 1);
            return formatResponse({
              status: "failed_fast",
              message: `Stopped at ID ${id} (${i + 1}/${ids.length}) due to error.`,
              summary: {
                total: ids.length,
                success_count: successes.length,
                failure_count: failures.length,
                remaining_count: remaining,
              },
              successes,
              failures,
            });
          }
        }
      }

      const total = ids.length;
      const successCount = successes.length;
      const failureCount = failures.length;

      return formatResponse({
        status:
          failureCount === 0
            ? "success"
            : successCount === 0
              ? "failed"
              : "partial_success",
        summary: {
          total,
          success_count: successCount,
          failure_count: failureCount,
        },
        successes:
          successCount > 50
            ? `${successCount} transactions deleted.`
            : successes,
        failures,
      });
    },
  );
}
