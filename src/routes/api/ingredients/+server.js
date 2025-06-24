import db from '$lib/server/db.js';

function isD1() {
  return typeof db.query === 'function' && db.query.length >= 2;
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ env } = {}) {
  if (isD1()) {
    const result = await db.query(
      'SELECT ingredients.id, ingredients.name FROM ingredients',
      [],
      env
    );
    return new Response(JSON.stringify(result.results || result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const ingredients = db.query('SELECT ingredients.id, ingredients.name FROM ingredients');
    return new Response(JSON.stringify(ingredients), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, env } = {}) {
  const { name } = await request.json();
  if (isD1()) {
    const result = await db.query('INSERT INTO ingredients (name) VALUES (?)', [name], env);
    return new Response(JSON.stringify({ id: result.meta?.last_row_id, name }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const info = db.query('INSERT INTO ingredients (name) VALUES (?)', [name]);
    return new Response(JSON.stringify({ id: info.lastInsertRowid, name }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ request, env } = {}) {
  const { id, name } = await request.json();
  if (isD1()) {
    await db.query('UPDATE ingredients SET name = ? WHERE id = ?', [name, id], env);
  } else {
    db.query('UPDATE ingredients SET name = ? WHERE id = ?', [name, id]);
  }
  return new Response(JSON.stringify({ id, name }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ request, env } = {}) {
  const { id } = await request.json();
  if (isD1()) {
    await db.query('DELETE FROM ingredients WHERE id = ?', [id], env);
  } else {
    db.query('DELETE FROM ingredients WHERE id = ?', [id]);
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
