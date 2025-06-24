import db from '$lib/server/db.js';
import { cookbooks, cookbook_recipes, recipes as recipesTable } from '$lib/server/schema.js';
import { eq, asc } from 'drizzle-orm';

async function getCookbookWithRecipes(drizzle, cookbookId) {
  const cb = (await drizzle.select().from(cookbooks).where(eq(cookbooks.id, cookbookId)))[0];
  if (!cb) return null;
  const recipes = await drizzle
    .select({
      ...recipesTable,
      ordering: cookbook_recipes.ordering
    })
    .from(cookbook_recipes)
    .leftJoin(recipesTable, eq(cookbook_recipes.recipe_id, recipesTable.id))
    .where(eq(cookbook_recipes.cookbook_id, cookbookId))
    .orderBy(asc(cookbook_recipes.ordering), asc(recipesTable.title));
  return { ...cb, recipes };
}

export async function GET({ env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const allCookbooks = await drizzle.select().from(cookbooks);
  const result = await Promise.all(allCookbooks.map(cb => getCookbookWithRecipes(drizzle, cb.id)));
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const data = await request.json();
  const [inserted] = await drizzle.insert(cookbooks).values({
    name: data.name,
    description: data.description,
    created: data.created || Date.now()
  }).returning();
  if (Array.isArray(data.recipes)) {
    for (const r of data.recipes) {
      await drizzle.insert(cookbook_recipes).values({
        cookbook_id: inserted.id,
        recipe_id: r.id,
        ordering: r.ordering
      });
    }
  }
  const cb = await getCookbookWithRecipes(drizzle, inserted.id);
  return new Response(JSON.stringify(cb), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const data = await request.json();
  await drizzle.update(cookbooks).set({
    name: data.name,
    description: data.description,
    created: data.created
  }).where(eq(cookbooks.id, data.id));
  await drizzle.delete(cookbook_recipes).where(eq(cookbook_recipes.cookbook_id, data.id));
  if (Array.isArray(data.recipes)) {
    for (const r of data.recipes) {
      await drizzle.insert(cookbook_recipes).values({
        cookbook_id: data.id,
        recipe_id: r.id,
        ordering: r.ordering
      });
    }
  }
  const cb = await getCookbookWithRecipes(drizzle, data.id);
  return new Response(JSON.stringify(cb), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { id } = await request.json();
  await drizzle.delete(cookbook_recipes).where(eq(cookbook_recipes.cookbook_id, id));
  await drizzle.delete(cookbooks).where(eq(cookbooks.id, id));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
