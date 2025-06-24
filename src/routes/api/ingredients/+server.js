import db from '$lib/server/db.js';
import { ingredients } from '$lib/server/schema.js';
import { eq } from 'drizzle-orm';

export async function GET({ env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const result = await drizzle.select().from(ingredients);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { name } = await request.json();
  const [inserted] = await drizzle.insert(ingredients).values({ name }).returning();
  return new Response(JSON.stringify(inserted), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { id, name } = await request.json();
  await drizzle.update(ingredients).set({ name }).where(eq(ingredients.id, id));
  return new Response(JSON.stringify({ id, name }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request, env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { id } = await request.json();
  await drizzle.delete(ingredients).where(eq(ingredients.id, id));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
