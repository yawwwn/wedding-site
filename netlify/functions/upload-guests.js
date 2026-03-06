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

    if (event.httpMethod === 'POST') {
      const { guests, columns } = JSON.parse(event.body);
      if (!Array.isArray(guests)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid data' }) };
      }

      // Ensure table exists with correct schema
      await sql`CREATE TABLE IF NOT EXISTS guests (
        id SERIAL PRIMARY KEY,
        name TEXT,
        table_no TEXT,
        extra JSONB,
        uploaded_at TIMESTAMPTZ DEFAULT now()
      )`;

      // Clear ALL existing guests — every upload is a full fresh replace
      await sql`DELETE FROM guests`;

      // Insert all guests fresh into the extra column
      for (const guest of guests) {
        const name = guest.name || guest.Name || guest.alias || Object.values(guest)[0] || '';
        const table_no = guest.table || guest.Table || guest.table_no || '';
        await sql`INSERT INTO guests (name, table_no, extra) VALUES (${name}, ${table_no}, ${JSON.stringify(guest)})`;
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
