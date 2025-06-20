import db from '$lib/server/db.js';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET() {
  const stmt = db.prepare(`
    SELECT ingredients.id, ingredients.name
    FROM ingredients
  `);
  const ingredients = stmt.all();
  return new Response(JSON.stringify(ingredients), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request }) {
  const { name } = await request.json();
  const stmt = db.prepare('INSERT INTO ingredients (name) VALUES (?)');
  const info = stmt.run(name);
  const ingredient = { id: info.lastInsertRowid, name };
  return new Response(JSON.stringify(ingredient), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function PUT({ request }) {
  const { id, name } = await request.json();
  const stmt = db.prepare('UPDATE ingredients SET name = ? WHERE id = ?');
  stmt.run(name, id);
  return new Response(JSON.stringify({ id, name }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function DELETE({ request }) {
  const { id } = await request.json();
  const stmt = db.prepare('DELETE FROM ingredients WHERE id = ?');
  stmt.run(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
