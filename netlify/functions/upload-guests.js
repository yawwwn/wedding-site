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

    if (event.httpMethod === 'GET') {
      const cols = await sql`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'guests' ORDER BY ordinal_position
      `;
      const colNames = cols.map(c => c.column_name);
      if (colNames.includes('data')) {
        const rows = await sql`SELECT data FROM guests ORDER BY id ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(rows.map(r => r.data)) };
      } else {
        const rows = await sql`SELECT * FROM guests ORDER BY id ASC`;
        return { statusCode: 200, headers, body: JSON.stringify(rows) };
      }
    }

    if (event.httpMethod === 'POST') {
      const { guests, columns } = JSON.parse(event.body);
      if (!Array.isArray(guests)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid data' }) };
      }

      // Drop and recreate with correct schema to clear old columns/data
      await sql`DROP TABLE IF EXISTS guests`;
      await sql`CREATE TABLE guests (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT now()
      )`;

      // Insert all guests fresh
      for (const guest of guests) {
        await sql`INSERT INTO guests (data) VALUES (${JSON.stringify(guest)})`;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, count: guests.length })
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('upload-guests error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
