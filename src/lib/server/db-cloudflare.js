// Cloudflare D1 DB abstraction for production
// Usage: db.query(sql, params)

export default {
  async query(sql, params = [], env) {
    if (!env || !env.DB) throw new Error('Cloudflare D1 binding (env.DB) is required');
    const result = await env.DB.prepare(sql).bind(...params).all();
    return result;
  },
  // Add more methods as needed (insert, update, etc.)
};
