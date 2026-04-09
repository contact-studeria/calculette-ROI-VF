module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE;
  const table = process.env.AIRTABLE_TABLE;

  if (!token) return res.status(500).json({ error: 'Missing env AIRTABLE_TOKEN' });
  if (!base) return res.status(500).json({ error: 'Missing env AIRTABLE_BASE' });
  if (!table) return res.status(500).json({ error: 'Missing env AIRTABLE_TABLE' });

  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: req.body })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Airtable request failed',
        airtable_status: response.status,
        airtable_body: data,
        debug: {
          url: url,
          base_prefix: base ? base.slice(0, 6) + '...' : null,
          table: table,
          token_prefix: token ? token.slice(0, 8) + '...' : null
        }
      });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({
      error: 'Server error',
      message: e.message,
      stack: e.stack
    });
  }
};
