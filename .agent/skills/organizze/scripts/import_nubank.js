const fs = require("node:fs");

/**
 * Script para processar CSV do Nubank para o Organizze.
 *
 * Uso: node import_nubank.js <caminho_csv> <data_alvo_yyyy-mm-dd> <is_march_filter_logic>
 */

const args = process.argv.slice(2);
const csvPath = args[0];
const targetDate = args[1] || "2026-02-15";
const filterLogic = args[2] === "true";

const CREDIT_CARD_ID = 402750;
const CATEGORY_ID = 56655796; // Outros

if (!csvPath || !fs.existsSync(csvPath)) {
  console.error("Erro: Caminho do CSV inválido.");
  process.exit(1);
}

function parseCSV(content) {
  const lines = content.split("\n").filter((l) => l.trim() !== "");
  const transactions = [];
  // Detectar separador (Nubank às vezes usa , e às vezes ;)
  const header = lines[0];
  const sep = header.includes(";") ? ";" : ",";

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = [];
    let current = "";
    let inQuote = false;
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuote = !inQuote;
      } else if (c === sep && !inQuote) {
        parts.push(current);
        current = "";
      } else {
        current += c;
      }
    }
    parts.push(current);

    if (parts.length < 3) continue;

    const date = parts[0].trim();
    const title = parts[1].replace(/^"|"$/g, "").replace(/""/g, '"').trim();
    const amountStr = parts[parts.length - 1].trim().replace(",", ".");
    const amount = parseFloat(amountStr);

    if (Number.isNaN(amount)) continue;

    transactions.push({ date, title, amount });
  }
  return transactions;
}

function processTransaction(t, forceDate, applyFilter) {
  if (t.title.toLowerCase().includes("pagamento recebido")) return null;

  let title = t.title;
  let baseTitle = title;
  let amount = t.amount;

  const match = title.match(/(.*?) - Parcela (\d+)\/(\d+)/i);
  let is_installment = false;
  let total_installments = 1;
  let installment_index = 1;
  let total = 1;

  if (match) {
    baseTitle = match[1].trim();
    installment_index = parseInt(match[2], 10);
    total = parseInt(match[3], 10);
    is_installment = true;
  }

  if (applyFilter && is_installment && installment_index > 1) {
    // Se for o segundo mês (ou posterior) de um import, ignorar parcelas > 1
    // pois elas já foram criadas como plano no mês 1.
    return null;
  }

  if (is_installment) {
    const remaining = total - installment_index + 1;
    title = baseTitle;
    amount = amount * remaining;
    total_installments = remaining;
  }

  // Organizze: despesas são negativas. No CSV Nubank faturas costumam vir positivo para gasto.
  const amount_cents = Math.round(amount * -100);

  return {
    description: title,
    date: forceDate,
    amount_cents: amount_cents,
    category_id: CATEGORY_ID,
    credit_card_id: CREDIT_CARD_ID,
    installments: is_installment,
    ...(is_installment
      ? {
          installments_attributes: {
            total: total_installments,
            periodicity: "monthly",
          },
        }
      : {}),
  };
}

const content = fs.readFileSync(csvPath, "utf8");
const rows = parseCSV(content);
const results = rows
  .map((r) => processTransaction(r, targetDate, filterLogic))
  .filter(Boolean);

console.log(JSON.stringify({ transactions: results }, null, 2));
