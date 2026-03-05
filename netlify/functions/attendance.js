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
    const sql = neon(process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL);
    
    await sql`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        table_no TEXT NOT NULL,
        checked_in_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    const rows = await sql`
      SELECT name, table_no, checked_in_at
      FROM checkins
      ORDER BY checked_in_at ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(rows)
    };
  } catch (err) {
    console.error('attendance error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server error', detail: err.message })
    };
  }
};
