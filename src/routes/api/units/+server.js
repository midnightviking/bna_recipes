import db from '$lib/server/db.js';
import { units } from '$lib/server/schema.js';
import { eq } from 'drizzle-orm';

export async function GET({ env } = {}) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const result = await drizzle.select().from(units);
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST({ request, env }) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { name, conversion_unit, conversion_threshold, conversion_formula } = await request.json();
  const [inserted] = await drizzle.insert(units).values({
    name,
    conversion_unit: conversion_unit || null,
    conversion_threshold: conversion_threshold === '' ? null : conversion_threshold,
    conversion_formula: conversion_formula || null
  }).returning();
  return new Response(JSON.stringify(inserted), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function PUT({ request, env }) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { id, name, conversion_unit, conversion_threshold, conversion_formula } = await request.json();
  await drizzle.update(units)
    .set({
      name,
      conversion_unit: conversion_unit || null,
      conversion_threshold: conversion_threshold === '' ? null : conversion_threshold,
      conversion_formula: conversion_formula || null
    })
    .where(eq(units.id, id));
  return new Response(JSON.stringify({ id, name, conversion_unit, conversion_threshold, conversion_formula }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function DELETE({ request, env }) {
  const drizzle = typeof db === 'function' ? db(env) : db;
  const { id } = await request.json();
  await drizzle.delete(units).where(eq(units.id, id));
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
