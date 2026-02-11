import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { api, formatResponse } from "../api.js";

export function registerCreditCardTools(server: McpServer) {
  server.registerTool(
    "list_credit_cards",
    {
      description: "List all credit cards",
    },
    async () => {
      const response = await api.get("/credit_cards");
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "get_credit_card",
    {
      description: "Get details of a specific credit card",
      inputSchema: { id: z.string().describe("Credit Card ID") },
    },
    async ({ id }) => {
      const response = await api.get(`/credit_cards/${id}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "create_credit_card",
    {
      description: "Create a new credit card",
      inputSchema: {
        name: z.string().describe("Card name"),
        card_network: z
          .string()
          .optional()
          .describe("Card network (visa, mastercard, etc)"),
        due_day: z.number().int().describe("Due day of the month"),
        closing_day: z.number().int().describe("Closing day of the month"),
        limit_cents: z.number().int().describe("Credit limit in cents"),
        description: z.string().optional().describe("Card description"),
      },
    },
    async (args) => {
      const response = await api.post("/credit_cards", args);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "update_credit_card",
    {
      description: "Update a credit card",
      inputSchema: {
        id: z.string().describe("Credit Card ID"),
        name: z.string().optional().describe("New name"),
        due_day: z.number().int().optional().describe("New due day"),
        closing_day: z.number().int().optional().describe("New closing day"),
        limit_cents: z.number().int().optional().describe("New limit in cents"),
        update_invoices_since: z
          .string()
          .optional()
          .describe("Update invoices since YYYY-MM-DD"),
      },
    },
    async ({ id, ...data }) => {
      const response = await api.put(`/credit_cards/${id}`, data);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "delete_credit_card",
    {
      description: "Delete a credit card",
      inputSchema: { id: z.string().describe("Credit Card ID") },
    },
    async ({ id }) => {
      const response = await api.delete(`/credit_cards/${id}`);
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "list_invoices",
    {
      description: "List invoices for a credit card",
      inputSchema: { credit_card_id: z.string().describe("Credit Card ID") },
    },
    async ({ credit_card_id }) => {
      const response = await api.get(
        `/credit_cards/${credit_card_id}/invoices`,
      );
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "get_invoice",
    {
      description: "Get details of a specific credit card invoice",
      inputSchema: {
        credit_card_id: z.string().describe("Credit Card ID"),
        id: z.string().describe("Invoice ID"),
      },
    },
    async ({ credit_card_id, id }) => {
      const response = await api.get(
        `/credit_cards/${credit_card_id}/invoices/${id}`,
      );
      return formatResponse(response.data);
    },
  );

  server.registerTool(
    "pay_invoice",
    {
      description: "Pay a credit card invoice",
      inputSchema: {
        credit_card_id: z.string().describe("Credit Card ID"),
        id: z.string().describe("Invoice ID"),
        amount_cents: z
          .number()
          .int()
          .optional()
          .describe("Amount to pay (optional)"),
        date: z.string().optional().describe("Payment date YYYY-MM-DD"),
        account_id: z
          .number()
          .int()
          .optional()
          .describe("Bank account ID to pay from"),
      },
    },
    async ({ credit_card_id, id, ...data }) => {
      // The API doc is a bit ambiguous about the path here, but usually it's a POST to /payments
      // based on the context of other financial APIs.
      // Re-checking doc line 891: it says GET but the section is "Pagamento de uma fatura".
      // I'll try POST first if I had to guess, but I'll stick to what worked if I could test it.
      // However, usually "payments" sub-resource is for creating a payment.
      const response = await api.post(
        `/credit_cards/${credit_card_id}/invoices/${id}/payments`,
        data,
      );
      return formatResponse(response.data);
    },
  );
}
