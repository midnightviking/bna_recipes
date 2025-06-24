import db from '$lib/server/db.js';

function isD1() {
  return typeof db.query === 'function' && db.query.length >= 2;
}

function getCookbookWithRecipesLocal(cookbookId) {
  const cb = db.query('SELECT * FROM cookbooks WHERE id = ?', [cookbookId])[0];
  if (!cb) return null;
  const recipes = db.query(`SELECT r.* FROM cookbook_recipes cr JOIN recipes r ON cr.recipe_id = r.id WHERE cr.cookbook_id = ? ORDER BY cr.ordering ASC, r.title ASC`, [cookbookId]);
  return { ...cb, recipes };
}

async function getCookbookWithRecipesD1(cookbookId, env) {
  const cbArr = await db.query('SELECT * FROM cookbooks WHERE id = ?', [cookbookId], env);
  const cb = (cbArr.results || cbArr)[0];
  if (!cb) return null;
  const recipesArr = await db.query(`SELECT r.* FROM cookbook_recipes cr JOIN recipes r ON cr.recipe_id = r.id WHERE cr.cookbook_id = ? ORDER BY cr.ordering ASC, r.title ASC`, [cookbookId], env);
  const recipes = recipesArr.results || recipesArr;
  return { ...cb, recipes };
}

export async function GET({ env } = {}) {
  if (isD1()) {
    const cbsArr = await db.query('SELECT * FROM cookbooks', [], env);
    const cbs = cbsArr.results || cbsArr;
    const result = await Promise.all(cbs.map(cb => getCookbookWithRecipesD1(cb.id, env)));
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const cbs = db.query('SELECT * FROM cookbooks');
    const result = cbs.map(cb => getCookbookWithRecipesLocal(cb.id));
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, env } = {}) {
  const data = await request.json();
  if (isD1()) {
    const result = await db.query('INSERT INTO cookbooks (name, description, created) VALUES (?, ?, ?)', [data.name, data.description, data.created || Date.now()], env);
    const cookbookId = result.meta?.last_row_id;
    if (Array.isArray(data.recipes)) {
      for (const r of data.recipes) {
        await db.query('INSERT INTO cookbook_recipes (cookbook_id, recipe_id, ordering) VALUES (?, ?, ?)', [cookbookId, r.id, r.ordering], env);
      }
    }
    const cb = await getCookbookWithRecipesD1(cookbookId, env);
    return new Response(JSON.stringify(cb), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const info = db.query('INSERT INTO cookbooks (name, description, created) VALUES (?, ?, ?)', [data.name, data.description, data.created || Date.now()]);
    if (Array.isArray(data.recipes)) {
      for (const r of data.recipes) {
        db.query('INSERT INTO cookbook_recipes (cookbook_id, recipe_id, ordering) VALUES (?, ?, ?)', [info.lastInsertRowid, r.id, r.ordering]);
      }
    }
    const cb = getCookbookWithRecipesLocal(info.lastInsertRowid);
    return new Response(JSON.stringify(cb), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request, env } = {}) {
  const data = await request.json();
  if (isD1()) {
    await db.query('UPDATE cookbooks SET name=?, description=?, created=? WHERE id=?', [data.name, data.description, data.created, data.id], env);
    await db.query('DELETE FROM cookbook_recipes WHERE cookbook_id = ?', [data.id], env);
    if (Array.isArray(data.recipes)) {
      for (const r of data.recipes) {
        await db.query('INSERT INTO cookbook_recipes (cookbook_id, recipe_id, ordering) VALUES (?, ?, ?)', [data.id, r.id, r.ordering], env);
      }
    }
    const cb = await getCookbookWithRecipesD1(data.id, env);
    return new Response(JSON.stringify(cb), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    db.query('UPDATE cookbooks SET name=?, description=?, created=? WHERE id=?', [data.name, data.description, data.created, data.id]);
    db.query('DELETE FROM cookbook_recipes WHERE cookbook_id = ?', [data.id]);
    if (Array.isArray(data.recipes)) {
      for (const r of data.recipes) {
        db.query('INSERT INTO cookbook_recipes (cookbook_id, recipe_id, ordering) VALUES (?, ?, ?)', [data.id, r.id, r.ordering]);
      }
    }
    const cb = getCookbookWithRecipesLocal(data.id);
    return new Response(JSON.stringify(cb), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request, env } = {}) {
  const { id } = await request.json();
  if (isD1()) {
    await db.query('DELETE FROM cookbook_recipes WHERE cookbook_id = ?', [id], env);
    await db.query('DELETE FROM cookbooks WHERE id = ?', [id], env);
  } else {
    db.query('DELETE FROM cookbook_recipes WHERE cookbook_id = ?', [id]);
    db.query('DELETE FROM cookbooks WHERE id = ?', [id]);
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
