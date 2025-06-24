import db from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

function isD1() {
  return typeof db.query === 'function' && db.query.length >= 2;
}

async function getRecipeWithIngredients(recipeId, env) {
  if (isD1()) {
    const recipeArr = await db.query('SELECT * FROM recipes WHERE id = ?', [recipeId], env);
    const recipe = (recipeArr.results || recipeArr)[0];
    if (!recipe) return null;
    const ingredients = (await db.query(`SELECT ri.ingredient_id, i.name, ri.quantity, u.id as unit_id, u.name as unit_name FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id = i.id LEFT JOIN units u ON ri.unit = u.id WHERE ri.recipe_id = ?`, [recipeId], env)).results || [];
    return { ...recipe, ingredients };
  } else {
    const recipeStmt = db.query('SELECT * FROM recipes WHERE id = ?', [recipeId]);
    const recipe = Array.isArray(recipeStmt) ? recipeStmt[0] : recipeStmt;
    if (!recipe) return null;
    const ingredients = db.query(`SELECT ri.ingredient_id, i.name, ri.quantity, u.id as unit_id, u.name as unit_name FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id = i.id LEFT JOIN units u ON ri.unit = u.id WHERE ri.recipe_id = ?`, [recipeId]);
    return { ...recipe, ingredients };
  }
}

export async function GET({ params, env } = {}) {
  const id = params.id;
  if (isD1()) {
    const cbArr = await db.query('SELECT * FROM cookbooks WHERE id = ?', [id], env);
    const cb = (cbArr.results || cbArr)[0];
    if (!cb) return json({ error: 'Cookbook not found' }, { status: 404 });
    const recipeRowsArr = await db.query('SELECT * FROM cookbook_recipes cr WHERE cr.cookbook_id = ? ORDER BY cr.ordering ASC', [id], env);
    const recipeRows = recipeRowsArr.results || recipeRowsArr;
    const recipes = await Promise.all(recipeRows.map(r => getRecipeWithIngredients(r.recipe_id, env)));
    return json({ ...cb, recipes, recipeRows });
  } else {
    const cb = db.query('SELECT * FROM cookbooks WHERE id = ?', [id])[0];
    if (!cb) return json({ error: 'Cookbook not found' }, { status: 404 });
    const recipeRows = db.query('SELECT * FROM cookbook_recipes cr WHERE cr.cookbook_id = ? ORDER BY cr.ordering ASC', [id]);
    const recipes = recipeRows.map(r => getRecipeWithIngredients(r.recipe_id)).filter(Boolean);
    return json({ ...cb, recipes, recipeRows });
  }
}
