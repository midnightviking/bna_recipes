import db from '$lib/server/db.js';

function getCookbookWithRecipes(cookbookId) {
  const cbStmt = db.prepare('SELECT * FROM cookbooks WHERE id = ?');
  const cb = cbStmt.get(cookbookId);
  if (!cb) return null;
  const recipesStmt = db.prepare(`
    SELECT r.* FROM cookbook_recipes cr
    JOIN recipes r ON cr.recipe_id = r.id
    WHERE cr.cookbook_id = ?
    ORDER BY cr.ordering ASC, r.title ASC
  `);
  const recipes = recipesStmt.all(cookbookId);
  return { ...cb, recipes };
}

export async function GET() {
  const cbsStmt = db.prepare('SELECT * FROM cookbooks');
  const cbs = cbsStmt.all();
  const result = cbs.map(cb => getCookbookWithRecipes(cb.id));
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request }) {
  const data = await request.json();
  const stmt = db.prepare('INSERT INTO cookbooks (name, description, created) VALUES (?, ?, ?)');
  const info = stmt.run(data.name, data.description, data.created || Date.now());
  // Insert recipes from data.recipes (array of {id, ordering})
  if (Array.isArray(data.recipes)) {
    const crStmt = db.prepare('INSERT INTO cookbook_recipes (cookbook_id, recipe_id, ordering) VALUES (?, ?, ?)');
    data.recipes.forEach(r => crStmt.run(info.lastInsertRowid, r.id, r.ordering));
  }
  const cb = getCookbookWithRecipes(info.lastInsertRowid);
  return new Response(JSON.stringify(cb), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request }) {
  const data = await request.json();
  const stmt = db.prepare('UPDATE cookbooks SET name=?, description=?, created=? WHERE id=?');
  stmt.run(data.name, data.description, data.created, data.id);
  // Update recipes: remove all, then re-insert from data.recipes
  db.prepare('DELETE FROM cookbook_recipes WHERE cookbook_id = ?').run(data.id);
  if (Array.isArray(data.recipes)) {
    const crStmt = db.prepare('INSERT INTO cookbook_recipes (cookbook_id, recipe_id, ordering) VALUES (?, ?, ?)');
    data.recipes.forEach(r => crStmt.run(data.id, r.id, r.ordering));
  }
  const cb = getCookbookWithRecipes(data.id);
  return new Response(JSON.stringify(cb), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request }) {
  const { id } = await request.json();
  db.prepare('DELETE FROM cookbook_recipes WHERE cookbook_id = ?').run(id);
  db.prepare('DELETE FROM cookbooks WHERE id = ?').run(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
