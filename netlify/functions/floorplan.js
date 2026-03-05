const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

    await sql`CREATE TABLE IF NOT EXISTS floorplan (
      id INT PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now()
    )`;

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT data FROM floorplan WHERE id = 1`;
      if (!rows.length) return { statusCode: 200, headers, body: JSON.stringify({ elements: [] }) };
      return { statusCode: 200, headers, body: JSON.stringify(rows[0].data) };
    }

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      await sql`
        INSERT INTO floorplan (id, data, updated_at)
        VALUES (1, ${JSON.stringify(data)}, now())
        ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = now()
      `;
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch(err) {
    console.error('Floorplan error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
