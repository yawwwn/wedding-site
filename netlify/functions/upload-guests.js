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

      // Clear ALL existing guests — every upload is a full fresh replace
      await sql`DELETE FROM guests`;

      // Insert using the exact column names the table already has
      for (const guest of guests) {
        await sql`INSERT INTO guests ("Name", "alias", "table", "relationship")
          VALUES (
            ${guest.Name || guest.name || ''},
            ${guest.alias || guest.Alias || ''},
            ${guest.table || guest.Table || ''},
            ${guest.relationship || guest.Relationship || ''}
          )`;
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
