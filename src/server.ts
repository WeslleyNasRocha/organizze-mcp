import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerBudgetTools } from "./tools/budgets.js";
import { registerCategoryTools } from "./tools/categories.js";
import { registerCreditCardTools } from "./tools/credit-cards.js";
import { registerTransactionTools } from "./tools/transactions.js";
import { registerTransferTools } from "./tools/transfers.js";
import { registerUserTools } from "./tools/users.js";

export const server = new McpServer({
  name: "organizze-mcp",
  version: "1.1.0",
});

export function registerAllTools() {
  registerUserTools(server);
  registerAccountTools(server);
  registerCategoryTools(server);
  registerBudgetTools(server);
  registerCreditCardTools(server);
  registerTransactionTools(server);
  registerTransferTools(server);
}
