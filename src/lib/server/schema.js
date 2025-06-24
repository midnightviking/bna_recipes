// Drizzle ORM schema for SQLite and D1
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
});

export const units = sqliteTable('units', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  conversion_unit: text('conversion_unit'),
  conversion_threshold: real('conversion_threshold'),
  conversion_formula: real('conversion_formula'),
});

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  minTemp: text('minTemp'),
  itemType: text('itemType'),
  portionSize: text('portionSize'),
  calories: text('calories'),
  category: text('category'),
  instructions: text('instructions'),
  ccp: text('ccp'),
  substitutions: text('substitutions'),
  initialServings: integer('initialServings'),
});

export const cookbooks = sqliteTable('cookbooks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  created: integer('created'),
});

export const recipe_ingredients = sqliteTable('recipe_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipe_id: integer('recipe_id').notNull(),
  ingredient_id: integer('ingredient_id').notNull(),
  quantity: real('quantity').notNull(),
  unit: integer('unit').notNull(),
});

export const cookbook_recipes = sqliteTable('cookbook_recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cookbook_id: integer('cookbook_id').notNull(),
  recipe_id: integer('recipe_id').notNull(),
  ordering: integer('ordering'),
});
