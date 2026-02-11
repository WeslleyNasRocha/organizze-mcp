---
name: organizze
description: Gestão financeira centralizada no Organizze para múltiplos bancos, cartões e contas
---

# Organizze Skill

Esta skill é o centro de comando para toda a vida financeira no Organizze. Ela permite a gestão multi-banco, controle de fluxo de caixa e conciliação de extratos de diversas instituições financeiras.

## Capacidades

1.  **Gestão Multi-Conta**: Listar, criar e monitorar saldos de múltiplas contas bancárias (Corrente, Poupança, Dinheiro, etc.).
2.  **Controle de Cartões de Crédito**: Gestão completa de faturas, limites e transações em diversos cartões.
3.  **Fluxo de Caixa e Transações**: Registro de receitas, despesas e transferências entre contas de forma granular.
4.  **Organização por Categorias**: Gestão da árvore de categorias para análise detalhada de gastos e ganhos.
5.  **Metas e Orçamentos**: Acesso a orçamentos (budgets) para acompanhamento de metas financeiras mensais.
6.  **Importação Inteligente**: Lógica para processar extratos bancários de diferentes origens, com automação específica para Nubank.

## Ferramentas Disponíveis (via MCP)

### Gestão de Contas e Bancos

- `mcp_organizze_list_accounts`: Lista todas as contas bancárias cadastradas.
- `mcp_organizze_get_account`: Detalhes específicos de uma conta (saldo, tipo).
- `mcp_organizze_create_account` / `update_account`: Manutenção do portfólio de contas.

### Movimentações

- `mcp_organizze_create_transaction`: Registro individual de movimentação.
- `mcp_organizze_create_bulk_transactions`: Importação em massa para conciliação bancária.
- `mcp_organizze_list_transactions`: Filtra o extrato geral por data, conta ou categoria.

### Cartão de Crédito

- `mcp_organizze_list_credit_cards`: Visão geral de todos os cartões.
- `mcp_organizze_list_invoices`: Acesso às faturas abertas, fechadas e futuras.

### Planejamento

- `mcp_organizze_list_budgets`: Consulta o status das suas metas de gastos.

## Automatização de Extratos (Específico: Nubank)

A skill possui scripts utilitários em `scripts/` para facilitar a vida com extratos complexos:

- **`import_nubank.js`**: Trata especificamente a lógica de parcelas recorrentes do Nubank para evitar duplicidade e ajustar datas de fechamento.

## Workflows Comuns

### Conciliação Bancária Semanal

1. Listar todas as contas (`mcp_organizze_list_accounts`).
2. Listar transações recentes para identificar buracos ou lançamentos pendentes.
3. Criar transações de ajuste ou transferências entre bancos.

### Gestão de Faturas

1. Verificar faturas próximas do vencimento em todos os cartões.
2. Conciliar compras recentes baixadas dos apps dos bancos com o que já está lançado.

## Boas Práticas

- **Diferenciação de Contas**: Use o `account_id` correto para garantir que cada despesa saia do banco certo.
- **Não Duvidar do Saldo**: Sempre use `list_accounts` para validar se o saldo no Organizze bate com o saldo real após uma importação.
- **Categorização Rigorosa**: Evite o uso excessivo da categoria "Outros". Use o sistema de categorias para gerar insights úteis.

## Evolução e Aprendizados Recentes

### Controle de Duplicatas (Fev/Mar 2026)

- **Desafio**: Rodar o script de importação múltiplas vezes ou ignorar parcelas já existentes no mês anterior causava duplicidade no Organizze.
- **Solução baked na Skill**: O script `import_nubank.js` agora possui uma flag `filterLogic`. Se `true`, ele ignora automaticamente qualquer parcela (X/Y) onde X > 1, pois assume que o plano parcelado completo foi criado no primeiro mês de lançamento.

### Integridade de Totais

- **Desafio**: Diferenças de centavos entre o CSV e o Organizze devido a arredondamentos.
- **Melhor Prática**: Sempre comparar o total real do Organizze (`amount_cents / -100`) com o total do CSV após o import. Se houver divergência, verificar se itens repetidos (ex: duas cobranças de NuTag no mesmo valor) foram removidos indevidamente pela lógica de deduplicação.

---

_Ultima atualização: 10/02/2026 - Otimização de lógica de parcelas e correção de totais._
