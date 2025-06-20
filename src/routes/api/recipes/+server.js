import db from '$lib/server/db.js';

function getRecipeWithIngredients(recipeId) {
  const recipeStmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
  const recipe = recipeStmt.get(recipeId);
  if (!recipe) return null;
  const ingredientsStmt = db.prepare(`
    SELECT ri.ingredient_id, i.name, ri.quantity, u.id as unit_id, u.name as unit_name
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    LEFT JOIN units u ON ri.unit = u.id
    WHERE ri.recipe_id = ?
  `);
  const ingredients = ingredientsStmt.all(recipeId);
  return { ...recipe, ingredients };
}

export async function GET() {
  const recipesStmt = db.prepare('SELECT * FROM recipes');
  const recipes = recipesStmt.all();
  const result = recipes.map(r => getRecipeWithIngredients(r.id));
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}
export async function POST({ request }) {
  const data = await request.json();
  const stmt = db.prepare(`INSERT INTO recipes (title, minTemp, itemType, portionSize, calories, category, instructions, ccp, substitutions, initialServings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const info = stmt.run(data.title, data.minTemp, data.itemType, data.portionSize, data.calories, data.category, data.instructions, data.ccp, data.substitutions, data.initialServings);
  // Insert ingredients
  if (Array.isArray(data.ingredients)) {
    const riStmt = db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');
    for (const ing of data.ingredients) {
      riStmt.run(info.lastInsertRowid, ing.ingredient_id, ing.quantity, ing.unit_id);
    }
  }
  const recipe = getRecipeWithIngredients(info.lastInsertRowid);
  return new Response(JSON.stringify(recipe), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request }) {
  const data = await request.json();
  const stmt = db.prepare(`UPDATE recipes SET title=?, minTemp=?, itemType=?, portionSize=?, calories=?, category=?, instructions=?, ccp=?, substitutions=?, initialServings=? WHERE id=?`);
  stmt.run(data.title, data.minTemp, data.itemType, data.portionSize, data.calories, data.category, data.instructions, data.ccp, data.substitutions, data.initialServings, data.id);
  // Update ingredients: remove all, then re-insert
  db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(data.id);
  if (Array.isArray(data.ingredients)) {
    const riStmt = db.prepare('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)');
    for (const ing of data.ingredients) {
      riStmt.run(data.id, ing.ingredient_id, ing.quantity, ing.unit_id);
    }
  }
  const recipe = getRecipeWithIngredients(data.id);
  return new Response(JSON.stringify(recipe), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request }) {
  const { id } = await request.json();
  db.prepare('DELETE FROM recipe_ingredients WHERE recipe_id = ?').run(id);
  db.prepare('DELETE FROM recipes WHERE id = ?').run(id);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
