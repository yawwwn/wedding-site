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
    const { name, table_no } = JSON.parse(event.body);
    if (!name || !table_no) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing name or table_no' }) };
    }

    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        table_no TEXT NOT NULL,
        checked_in_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // Prevent duplicate check-ins
    const existing = await sql`
      SELECT id FROM checkins WHERE LOWER(name) = LOWER(${name})
    `;
    if (existing.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, duplicate: true, message: 'Already checked in' })
      };
    }

    await sql`
      INSERT INTO checkins (name, table_no) VALUES (${name}, ${table_no})
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, duplicate: false })
    };
  } catch (err) {
    console.error('checkin error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', detail: err.message })
    };
  }
};
