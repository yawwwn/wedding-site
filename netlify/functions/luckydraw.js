const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

  await sql`CREATE TABLE IF NOT EXISTS luckydraw (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    table_no TEXT NOT NULL,
    collected_at TIMESTAMPTZ DEFAULT now()
  )`;

  if (event.httpMethod === 'DELETE') {
    const body = JSON.parse(event.body);
    if (body.clearAll) {
      await sql`DELETE FROM luckydraw`;
    } else {
      await sql`DELETE FROM luckydraw WHERE LOWER(name) = LOWER(${body.name})`;
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  if (event.httpMethod === 'POST') {
    const { name, table_no } = JSON.parse(event.body);
    if (!name || !table_no) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing fields' }) };
    const existing = await sql`SELECT id FROM luckydraw WHERE LOWER(name) = LOWER(${name})`;
    if (existing.length > 0) return { statusCode: 200, headers, body: JSON.stringify({ ok: true, duplicate: true }) };
    await sql`INSERT INTO luckydraw (name, table_no) VALUES (${name}, ${table_no})`;
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, duplicate: false }) };
  }

  if (event.httpMethod === 'GET') {
    const rows = await sql`SELECT name, table_no, collected_at FROM luckydraw ORDER BY collected_at ASC`;
    return { statusCode: 200, headers, body: JSON.stringify(rows) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
