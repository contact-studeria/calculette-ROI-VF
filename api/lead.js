module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const base = process.env.AIRTABLE_BASE;
  const table = process.env.AIRTABLE_TABLE;

  if (!token || !base || !table) {
    return res.status(500).json({ error: 'Missing Airtable configuration' });
  }

  const body = req.body || {};
  const clean = (v) => (typeof v === 'string' ? v.trim() : v);

  const prenom = clean(body.prenom);
  const nom = clean(body.nom);
  const email = clean(body.email);
  const tel = clean(body.tel);
  const entreprise = clean(body.Entreprise);

  const missing = [];
  if (!prenom) missing.push('prenom');
  if (!nom) missing.push('nom');
  if (!email) missing.push('email');
  if (!tel) missing.push('tel');
  if (!entreprise) missing.push('Entreprise');

  if (missing.length) {
    return res.status(400).json({
      error: 'Missing required fields',
      fields: missing
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const fields = {
    ...body,
    prenom,
    nom,
    email,
    tel,
    Entreprise: entreprise
  };

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
};
