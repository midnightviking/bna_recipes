import { recipe } from '$lib/components/RecipePrintTemplate.svelte';
import db from '$lib/server/db.js';
import { json } from '@sveltejs/kit';

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

export async function GET({ params }) {
  const id = params.id;
  const cbStmt = db.prepare('SELECT * FROM cookbooks WHERE id = ?');
  const cb = cbStmt.get(id);
  if (!cb) return json({ error: 'Cookbook not found' }, { status: 404 });
  // Get all recipe IDs for this cookbook, ordered
  const recipeIdsStmt = db.prepare(`
    SELECT * FROM cookbook_recipes cr
    WHERE cr.cookbook_id = ?
    ORDER BY cr.ordering ASC
  `);
  const recipeRows = recipeIdsStmt.all(id);
  // Get full recipe objects with ingredients
  const recipes = recipeRows.map(r => getRecipeWithIngredients(r.recipe_id)).filter(Boolean);
  return json({ ...cb, recipes, recipeRows });
}
