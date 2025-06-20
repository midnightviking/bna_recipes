// Data abstraction for Recipes, Ingredients, and Cookbooks using localStorage

const STORAGE_KEYS = {
  recipes: 'recipes',
  ingredients: 'ingredients',
  cookbooks: 'cookbooks'
};

export function getAll(key) {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
}

export function saveAll(key, data) {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
}

export function addItem(key, item) {
  const items = getAll(key);
  items.push(item);
  saveAll(key, items);
}

export function updateItem(key, id, newItem) {
  let items = getAll(key);
  items = items.map(item => item.id === id ? newItem : item);
  saveAll(key, items);
}

export function deleteItem(key, id) {
  let items = getAll(key);
  items = items.filter(item => item.id !== id);
  saveAll(key, items);
}

export function getItem(key, id) {
  const items = getAll(key);
  return items.find(item => item.id === id);
}
