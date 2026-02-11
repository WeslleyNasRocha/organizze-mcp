# Organizze MCP Server

This is a Model Context Protocol (MCP) server for the [Organizze API](https://api.organizze.com.br/rest/v2).

## Features

- **Accounts**: List, get, create, update, and delete bank accounts.
- **Categories**: List, get, create, update, and delete categories.
- **Transactions**: List, get, create, update, and delete transactions (movimentações).
- **Credit Cards**: List and get credit card details.
- **Invoices**: List invoices for credit cards.
- **Budgets**: List budgets (metas) by period.

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your `ORGANIZZE_EMAIL` and `ORGANIZZE_TOKEN`. You can find your token at [app.organizze.com.br/configuracoes/api-keys](https://app.organizze.com.br/configuracoes/api-keys).

## Usage with Bun

To run the server:

```bash
bun run start
```

## Running with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "organizze": {
      "command": "bun",
      "args": [
        "/home/weslleyr/projects/personal/finances/organizze-mcp/index.ts"
      ],
      "env": {
        "ORGANIZZE_EMAIL": "your-email@example.com",
        "ORGANIZZE_TOKEN": "your-api-token",
        "ORGANIZZE_NAME": "YourAppName"
      }
    }
  }
}
```

## Tools

- `get_user`: Get current user details.
- `list_accounts`: List all bank accounts.
- `get_account`: Get details of a specific account.
- `create_account`: Create a new bank account.
- `update_account`: Update a bank account.
- `delete_account`: Delete a bank account.
- `list_categories`: List all categories.
- `get_category`: Get details of a specific category.
- `create_category`: Create a new category.
- `update_category`: Update a category.
- `delete_category`: Delete a category.
- `list_credit_cards`: List all credit cards.
- `get_credit_card`: Get details of a specific credit card.
- `list_invoices`: List invoices for a credit card.
- `list_budgets`: List budgets for a period.
- `list_transactions`: List transactions with optional filters.
- `create_transaction`: Create a new transaction.
- `get_transaction`: Get details of a specific transaction.
- `update_transaction`: Update a transaction.
- `delete_transaction`: Delete a transaction.
