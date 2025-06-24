import db from '$lib/server/db.js';

function isD1() {
  return typeof db.query === 'function' && db.query.length >= 2;
}

export async function GET({ env } = {}) {
  if (isD1()) {
    const result = await db.query('SELECT * FROM units', [], env);
    return new Response(JSON.stringify(result.results || result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const units = db.query('SELECT * FROM units');
    return new Response(JSON.stringify(units), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, env } = {}) {
  const { name, conversion_unit, conversion_threshold, conversion_formula } = await request.json();
  if (isD1()) {
    const result = await db.query(
      'INSERT INTO units (name, conversion_unit, conversion_threshold, conversion_formula) VALUES (?, ?, ?, ?)',
      [name, conversion_unit || null, conversion_threshold === '' ? null : conversion_threshold, conversion_formula || null],
      env
    );
    return new Response(JSON.stringify({ id: result.meta?.last_row_id, name, conversion_unit, conversion_threshold, conversion_formula }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const info = db.query(
      'INSERT INTO units (name, conversion_unit, conversion_threshold, conversion_formula) VALUES (?, ?, ?, ?)',
      [name, conversion_unit || null, conversion_threshold === '' ? null : conversion_threshold, conversion_formula || null]
    );
    return new Response(JSON.stringify({ id: info.lastInsertRowid, name, conversion_unit, conversion_threshold, conversion_formula }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request, env } = {}) {
  const { id, name, conversion_unit, conversion_threshold, conversion_formula } = await request.json();
  if (isD1()) {
    await db.query(
      'UPDATE units SET name = ?, conversion_unit = ?, conversion_threshold = ?, conversion_formula = ? WHERE id = ?',
      [name, conversion_unit || null, conversion_threshold === '' ? null : conversion_threshold, conversion_formula || null, id],
      env
    );
    return new Response(JSON.stringify({ id, name, conversion_unit, conversion_threshold, conversion_formula }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    db.query(
      'UPDATE units SET name = ?, conversion_unit = ?, conversion_threshold = ?, conversion_formula = ? WHERE id = ?',
      [name, conversion_unit || null, conversion_threshold === '' ? null : conversion_threshold, conversion_formula || null, id]
    );
    return new Response(JSON.stringify({ id, name, conversion_unit, conversion_threshold, conversion_formula }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request, env } = {}) {
  const { id } = await request.json();
  if (isD1()) {
    await db.query('DELETE FROM units WHERE id = ?', [id], env);
  } else {
    db.query('DELETE FROM units WHERE id = ?', [id]);
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
