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

      // Drop and recreate with known schema — guaranteed clean slate every upload
      await sql`DROP TABLE IF EXISTS guests`;
      await sql`CREATE TABLE guests (
        id SERIAL PRIMARY KEY,
        name TEXT,
        alias TEXT,
        tableno TEXT,
        relationship TEXT,
        uploaded_at TIMESTAMPTZ DEFAULT now()
      )`;

      for (const guest of guests) {
        const name         = guest.Name         || guest.name         || '';
        const alias        = guest.Alias        || guest.alias        || '';
        const tableno      = guest.Table        || guest.table        || guest.table_no || '';
        const relationship = guest.Relationship || guest.relationship || '';
        await sql`INSERT INTO guests (name, alias, tableno, relationship)
          VALUES (${name}, ${alias}, ${tableno}, ${relationship})`;
      }

      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, count: guests.length }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('upload-guests error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
