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

    const rows = await sql`SELECT "Name", "alias", "table", "relationship" FROM guests ORDER BY id ASC`;

    // Map to consistent lowercase keys that the frontend expects
    const guests = rows.map(r => ({
      name: r.Name || r.name || '',
      alias: r.alias || '',
      table: r.table || '',
      relationship: r.relationship || ''
    }));

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
