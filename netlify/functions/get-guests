const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        table_no TEXT,
        extra JSONB,
        uploaded_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    const rows = await sql`SELECT extra FROM guests ORDER BY id ASC`;

    // Return the full guest objects from JSONB
    const guests = rows.map(r => r.extra);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ guests })
    };
  } catch (err) {
    console.error('get-guests error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', detail: err.message })
    };
  }
};
