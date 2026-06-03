// Vercel serverless function — proxies structured queries to Neon PostgreSQL
// Frontend sends { table, method, filters, data, options } via POST
// Server builds safe parameterized SQL and returns { data, error }

import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.NEON_DATABASE_URL;

/**
 * Build a WHERE clause from a filters object.
 * Special operators via __{op} suffix: __neq, __gt, __gte, __lt, __lte, __like, __in
 * Simple value = eq.
 */
function buildWhereClauses(filters, params) {
  const clauses = [];
  for (const [key, value] of Object.entries(filters)) {
    const parts = key.split("__");
    const col = parts[0];
    const op = parts[1] || "eq";
    if (op === "is_null") {
      clauses.push(`"${col}" IS NULL`);
    } else if (op === "in" && Array.isArray(value)) {
      const idx = params.length + 1;
      clauses.push(`"${col}" = ANY($${idx})`);
      params.push(value);
    } else {
      const idx = params.length + 1;
      const sqlOp = OP_MAP[op] || "=";
      clauses.push(`"${col}" ${sqlOp} $${idx}`);
      params.push(value);
    }
  }
  return clauses;
}

const OP_MAP = { eq: "=", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=", like: "LIKE" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!DATABASE_URL) {
    return res.status(503).json({ error: "Neon database not configured. Set NEON_DATABASE_URL in your server environment." });
  }

  const sql = neon(DATABASE_URL);

  try {
    const { table, method, filters, data, options } = req.body;
    let query, params = [], rows;

    switch (method) {
      case "select": {
        const cols = options?.columns || "*";
        query = `SELECT ${cols} FROM "${table}"`;
        if (filters && Object.keys(filters).length) {
          query += " WHERE " + buildWhereClauses(filters, params).join(" AND ");
        }
        if (options?.order) {
          const dir = options?.ascending === false ? "DESC" : "ASC";
          query += ` ORDER BY "${options.order}" ${dir}`;
        }
        if (options?.limit) query += ` LIMIT ${options.limit}`;
        rows = await sql(query, ...params);
        return res.status(200).json({ data: options?.single ? (rows[0] || null) : rows });
      }

      case "insert": {
        if (!data || !Object.keys(data).length) {
          return res.status(400).json({ error: "No data provided for insert" });
        }
        const keys = Object.keys(data);
        const vals = keys.map(k => data[k]);
        const cols = keys.map(k => `"${k}"`).join(", ");
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        query = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`;
        rows = await sql(query, ...vals);
        return res.status(200).json({ data: rows });
      }

      case "update": {
        if (!data || !Object.keys(data).length) {
          return res.status(400).json({ error: "No data provided for update" });
        }
        const keys = Object.keys(data);
        const vals = keys.map(k => data[k]);
        const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
        query = `UPDATE "${table}" SET ${setClauses}`;
        params = [...vals];
        if (filters && Object.keys(filters).length) {
          query += " WHERE " + buildWhereClauses(filters, params).join(" AND ");
        }
        query += " RETURNING *";
        rows = await sql(query, ...params);
        return res.status(200).json({ data: rows });
      }

      case "delete": {
        query = `DELETE FROM "${table}"`;
        if (filters && Object.keys(filters).length) {
          query += " WHERE " + buildWhereClauses(filters, params).join(" AND ");
        }
        query += " RETURNING *";
        rows = await sql(query, ...params);
        return res.status(200).json({ data: rows });
      }

      case "raw": {
        const rawSql = req.body.sql;
        if (!rawSql) return res.status(400).json({ error: "No SQL provided for raw query" });
        rows = await sql(rawSql, ...(req.body.params || []));
        return res.status(200).json({ data: rows });
      }

      case "count": {
        query = `SELECT COUNT(*) as count FROM "${table}"`;
        if (filters && Object.keys(filters).length) {
          query += " WHERE " + buildWhereClauses(filters, params).join(" AND ");
        }
        rows = await sql(query, ...params);
        return res.status(200).json({ count: Number(rows[0]?.count) || 0 });
      }

      default:
        return res.status(400).json({ error: `Unknown method: ${method}` });
    }
  } catch (err) {
    console.error("Neon query error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
