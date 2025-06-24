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

export async function GET({ env } = {}) {
  if (isD1()) {
    const recipesArr = await db.query('SELECT * FROM recipes', [], env);
    const recipes = recipesArr.results || recipesArr;
    const result = await Promise.all(recipes.map(r => getRecipeWithIngredients(r.id, env)));
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const recipes = db.query('SELECT * FROM recipes');
    const result = recipes.map(r => getRecipeWithIngredients(r.id));
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, env } = {}) {
  const data = await request.json();
  if (isD1()) {
    const result = await db.query(`INSERT INTO recipes (title, minTemp, itemType, portionSize, calories, category, instructions, ccp, substitutions, initialServings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.title, data.minTemp, data.itemType, data.portionSize, data.calories, data.category, data.instructions, data.ccp, data.substitutions, data.initialServings], env);
    const recipeId = result.meta?.last_row_id;
    if (Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        await db.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)', [recipeId, ing.ingredient_id, ing.quantity, ing.unit_id], env);
      }
    }
    const recipe = await getRecipeWithIngredients(recipeId, env);
    return new Response(JSON.stringify(recipe), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    const info = db.query(`INSERT INTO recipes (title, minTemp, itemType, portionSize, calories, category, instructions, ccp, substitutions, initialServings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [data.title, data.minTemp, data.itemType, data.portionSize, data.calories, data.category, data.instructions, data.ccp, data.substitutions, data.initialServings]);
    if (Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        db.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)', [info.lastInsertRowid, ing.ingredient_id, ing.quantity, ing.unit_id]);
      }
    }
    const recipe = getRecipeWithIngredients(info.lastInsertRowid);
    return new Response(JSON.stringify(recipe), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request, env } = {}) {
  const data = await request.json();
  if (isD1()) {
    await db.query(`UPDATE recipes SET title=?, minTemp=?, itemType=?, portionSize=?, calories=?, category=?, instructions=?, ccp=?, substitutions=?, initialServings=? WHERE id=?`, [data.title, data.minTemp, data.itemType, data.portionSize, data.calories, data.category, data.instructions, data.ccp, data.substitutions, data.initialServings, data.id], env);
    await db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [data.id], env);
    if (Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        await db.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)', [data.id, ing.ingredient_id, ing.quantity, ing.unit_id], env);
      }
    }
    const recipe = await getRecipeWithIngredients(data.id, env);
    return new Response(JSON.stringify(recipe), {
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    db.query(`UPDATE recipes SET title=?, minTemp=?, itemType=?, portionSize=?, calories=?, category=?, instructions=?, ccp=?, substitutions=?, initialServings=? WHERE id=?`, [data.title, data.minTemp, data.itemType, data.portionSize, data.calories, data.category, data.instructions, data.ccp, data.substitutions, data.initialServings, data.id]);
    db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [data.id]);
    if (Array.isArray(data.ingredients)) {
      for (const ing of data.ingredients) {
        db.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)', [data.id, ing.ingredient_id, ing.quantity, ing.unit_id]);
      }
    }
    const recipe = getRecipeWithIngredients(data.id);
    return new Response(JSON.stringify(recipe), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request, env } = {}) {
  const { id } = await request.json();
  if (isD1()) {
    await db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id], env);
    await db.query('DELETE FROM recipes WHERE id = ?', [id], env);
  } else {
    db.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
    db.query('DELETE FROM recipes WHERE id = ?', [id]);
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
