import db from '$lib/server/db.js';
import { recipes, recipe_ingredients, ingredients as ingredientsTable, units as unitsTable } from '$lib/server/schema.js';
import { eq } from 'drizzle-orm';

async function getRecipeWithIngredients(drizzle, recipeId) {
  const recipe = (await drizzle.select().from(recipes).where(eq(recipes.id, recipeId)))[0];
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

export async function GET({ env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const allRecipes = await drizzle.select().from(recipes);
  const result = await Promise.all(allRecipes.map(r => getRecipeWithIngredients(drizzle, r.id)));
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const data = await request.json();
  const [inserted] = await drizzle.insert(recipes).values({
    title: data.title,
    minTemp: data.minTemp,
    itemType: data.itemType,
    portionSize: data.portionSize,
    calories: data.calories,
    category: data.category,
    instructions: data.instructions,
    ccp: data.ccp,
    substitutions: data.substitutions,
    initialServings: data.initialServings
  }).returning();
  if (Array.isArray(data.ingredients)) {
    for (const ing of data.ingredients) {
      await drizzle.insert(recipe_ingredients).values({
        recipe_id: inserted.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit_id
      });
    }
  }
  const recipe = await getRecipeWithIngredients(drizzle, inserted.id);
  return new Response(JSON.stringify(recipe), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const data = await request.json();
  await drizzle.update(recipes).set({
    title: data.title,
    minTemp: data.minTemp,
    itemType: data.itemType,
    portionSize: data.portionSize,
    calories: data.calories,
    category: data.category,
    instructions: data.instructions,
    ccp: data.ccp,
    substitutions: data.substitutions,
    initialServings: data.initialServings
  }).where(eq(recipes.id, data.id));
  await drizzle.delete(recipe_ingredients).where(eq(recipe_ingredients.recipe_id, data.id));
  if (Array.isArray(data.ingredients)) {
    for (const ing of data.ingredients) {
      await drizzle.insert(recipe_ingredients).values({
        recipe_id: data.id,
        ingredient_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit_id
      });
    }
  }
  const recipe = await getRecipeWithIngredients(drizzle, data.id);
  return new Response(JSON.stringify(recipe), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { id } = await request.json();
  await drizzle.delete(recipe_ingredients).where(eq(recipe_ingredients.recipe_id, id));
  await drizzle.delete(recipes).where(eq(recipes.id, id));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
