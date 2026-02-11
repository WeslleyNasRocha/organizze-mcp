import axios from "axios";

const ORGANIZZE_EMAIL = process.env.ORGANIZZE_EMAIL;
const ORGANIZZE_TOKEN = process.env.ORGANIZZE_TOKEN;
const ORGANIZZE_NAME = process.env.ORGANIZZE_NAME;

if (!ORGANIZZE_EMAIL || !ORGANIZZE_TOKEN || !ORGANIZZE_NAME) {
  console.error(
    "Error: ORGANIZZE_EMAIL, ORGANIZZE_TOKEN and ORGANIZZE_NAME must be set.",
  );
  process.exit(1);
}

export const api = axios.create({
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

export const formatResponse = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});
