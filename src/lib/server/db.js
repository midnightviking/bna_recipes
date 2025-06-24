// DB abstraction: uses better-sqlite3 locally, Cloudflare D1 in production
const useD1 = process.env.USE_D1 === 'true' || process.env.NODE_ENV === 'production';

async function getDb() {
  if (!useD1) {
    // Local development: better-sqlite3
    /* const Database = (await import('better-sqlite3')).default;
    const db = new Database('app.db', { verbose: console.log });
    db.pragma('journal_mode = WAL');
    // Table creation SQL
    const createStatements = [
      `CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );`,
      `CREATE TABLE IF NOT EXISTS units(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        conversion_unit TEXT,
        conversion_threshold REAL,
        conversion_formula REAL
      );`,
      `CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        minTemp TEXT,
        itemType TEXT,
        portionSize TEXT,
        calories TEXT,
        category TEXT,
        instructions TEXT,
        ccp TEXT,
        substitutions TEXT,
        initialServings INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS cookbooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created INTEGER
      );`,
      `CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        ingredient_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS cookbook_recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cookbook_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        ordering INTEGER,
        FOREIGN KEY (cookbook_id) REFERENCES cookbooks(id) ON DELETE CASCADE,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );`
    ];
    for (const stmt of createStatements) {
      db.exec(stmt);
    }
    return {
      query(sql, params = []) {
        const stmt = db.prepare(sql);
        if (/^select/i.test(sql.trim())) {
          return stmt.all(...params);
        } else {
          return stmt.run(...params);
        }
      }
    }; */
  } else {
    // Production: Cloudflare D1
    const dbCloudflare = (await import('./db-cloudflare.js')).default;
    return dbCloudflare;
  }
}

const dbInstance = await getDb();
console.log(dbInstance);
export default dbInstance;