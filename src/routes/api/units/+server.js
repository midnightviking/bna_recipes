import db from '$lib/server/db.js';

export async function GET() {
  const stmt = db.prepare('SELECT * FROM units');
  const units = stmt.all();
  return new Response(JSON.stringify(units), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  const { name, conversion_unit, conversion_threshold, conversion_formula } = await request.json();
  const stmt = db.prepare('INSERT INTO units (name, conversion_unit, conversion_threshold, conversion_formula) VALUES (?, ?, ?, ?)');
  const info = stmt.run(
    name,
    conversion_unit || null,
    conversion_threshold === '' ? null : conversion_threshold,
    conversion_formula || null
  );
  const unit = { id: info.lastInsertRowid, name, conversion_unit, conversion_threshold, conversion_formula };
  return new Response(JSON.stringify(unit), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request }) {
  const { id, name, conversion_unit, conversion_threshold, conversion_formula } = await request.json();
  const stmt = db.prepare('UPDATE units SET name = ?, conversion_unit = ?, conversion_threshold = ?, conversion_formula = ? WHERE id = ?');
  stmt.run(
    name,
    conversion_unit || null,
    conversion_threshold === '' ? null : conversion_threshold,
    conversion_formula || null,
    id
  );
  return new Response(JSON.stringify({ id, name, conversion_unit, conversion_threshold, conversion_formula }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request }) {
  const { id } = await request.json();
  const stmt = db.prepare('DELETE FROM units WHERE id = ?');
  stmt.run(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
