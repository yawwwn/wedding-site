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

    await sql`CREATE TABLE IF NOT EXISTS guests (
      id SERIAL PRIMARY KEY,
      data JSONB NOT NULL,
      uploaded_at TIMESTAMPTZ DEFAULT now()
    )`;

    if (event.httpMethod === 'POST') {
      const { guests, columns } = JSON.parse(event.body);
      if (!Array.isArray(guests)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid data' }) };
      }

      // Clear ALL existing guests first — every upload is a full fresh replace
      await sql`DELETE FROM guests`;

      // Insert all new guests
      for (const guest of guests) {
        await sql`INSERT INTO guests (data) VALUES (${JSON.stringify(guest)})`;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, count: guests.length })
      };
    }

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT data FROM guests ORDER BY id ASC`;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rows.map(r => r.data))
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
