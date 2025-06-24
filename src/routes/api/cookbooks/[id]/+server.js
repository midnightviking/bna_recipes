import db from '$lib/server/db.js';
import { cookbooks, cookbook_recipes, recipes as recipesTable, recipe_ingredients, ingredients as ingredientsTable, units as unitsTable } from '$lib/server/schema.js';
import { eq, asc } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

async function getRecipeWithIngredients(drizzle, recipeId) {
  const recipe = (await drizzle.select().from(recipesTable).where(eq(recipesTable.id, recipeId)))[0];
  if (!recipe) return null;
  const ingredients = await drizzle
    .select({
      ingredient_id: recipe_ingredients.ingredient_id,
      name: ingredientsTable.name,
      quantity: recipe_ingredients.quantity,
      unit_id: unitsTable.id,
      unit_name: unitsTable.name
    })
    .from(recipe_ingredients)
    .leftJoin(ingredientsTable, eq(recipe_ingredients.ingredient_id, ingredientsTable.id))
    .leftJoin(unitsTable, eq(recipe_ingredients.unit, unitsTable.id))
    .where(eq(recipe_ingredients.recipe_id, recipeId));
  return { ...recipe, ingredients };
}

export async function GET({ params, env } = {}) {
  const id = Number(params.id);
  const drizzle = typeof db === 'function' ? db(env) : db;
  const cb = (await drizzle.select().from(cookbooks).where(eq(cookbooks.id, id)))[0];
  if (!cb) return json({ error: 'Cookbook not found' }, { status: 404 });
  const recipeRows = await drizzle
    .select()
    .from(cookbook_recipes)
    .where(eq(cookbook_recipes.cookbook_id, id))
    .orderBy(asc(cookbook_recipes.ordering));
  const recipes = await Promise.all(
    recipeRows.map(r => getRecipeWithIngredients(drizzle, r.recipe_id))
  );
  return json({ ...cb, recipes, recipeRows });
}
