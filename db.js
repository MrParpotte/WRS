// db.js
import { Pool } from "pg";

const isProd = process.env.NODE_ENV === "production";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProd ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);
