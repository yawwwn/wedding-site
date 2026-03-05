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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { guests, columns } = JSON.parse(event.body);
    if (!guests || !Array.isArray(guests)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid guest data' }) };
    }

  const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);

    // Create guests table
    await sql`
      CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        table_no TEXT,
        extra JSONB,
        uploaded_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Clear existing guests and re-upload (full replace)
    await sql`DELETE FROM guests`;

    // Insert all guests — store extra columns as JSONB
    for (const g of guests) {
      const name = g.name || g.alias || Object.values(g)[0] || '';
      const table_no = g.table || '';
      // Store all fields in extra for flexible retrieval
      await sql`
        INSERT INTO guests (name, table_no, extra)
        VALUES (${name}, ${table_no}, ${JSON.stringify(g)})
      `;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, count: guests.length })
    };
  } catch (err) {
    console.error('upload-guests error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', detail: err.message })
    };
  }
};
