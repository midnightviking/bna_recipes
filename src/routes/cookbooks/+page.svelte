<script>
  import { onMount } from 'svelte';
  import Button from '@smui/button';
  import Textfield from '@smui/textfield';
  import Select,{Option} from '@smui/select';

  let cookbooks = $state([]);
  let allRecipes = [];
  let showForm = $state(false);
  let editing = false;
  let editId = null;

  let name = '';
  let description = '';
  let selectedRecipeIds = [];
  let sortMode = 'added';
  let dragIndex = null;

  function resetForm() {
    name = '';
    description = '';
    selectedRecipeIds = [];
    editing = false;
    editId = null;
    dragIndex = null;
  }

  function openForm(cookbook = null) {
    showForm = true;
    if (cookbook) {
      editing = true;
      editId = cookbook.id;
      name = cookbook.name;
      description = cookbook.description;
      selectedRecipeIds = (cookbook.recipes || []).map(r => r.id);
    } else {
      resetForm();
    }
  }

  function closeForm() {
    showForm = false;
    resetForm();
  }

  async function saveCookbook() {
    const cookbook = {
      id: editing ? editId : undefined,
      name,
      description,
      // recipeIds removed, handled by join table
      recipes: selectedRecipeIds.map((id, idx) => ({ id, ordering: idx }))
    };
    if (editing) {
      await fetch('/api/cookbooks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cookbook, id: editId })
      });
    } else {
      await fetch('/api/cookbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cookbook)
      });
    }
    await loadCookbooks();
    closeForm();
  }

  async function removeCookbook(id) {
    await fetch('/api/cookbooks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    await loadCookbooks();
  }

  async function loadCookbooks() {
    const res = await fetch('/api/cookbooks');
    if (res.ok) {
      console.log(res);
      cookbooks = await res.json();
    }
  }

  async function loadRecipes() {
    const res = await fetch('/api/recipes');
    if (res.ok) {
      allRecipes = await res.json();
    }
  }

  function getCookbookRecipesByOrder() {
    return selectedRecipeIds.map(id => allRecipes.find(r => r.id === id)).filter(Boolean);
  }

  function handleDragStart(e, idx) {
    dragIndex = idx;
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, idx) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const newOrder = [...selectedRecipeIds];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(idx, 0, moved);
    selectedRecipeIds = newOrder;
    dragIndex = idx;
  }

  function handleDrop(e) {
    e.preventDefault();
    dragIndex = null;
  }

  function handleDragEnd() {
    dragIndex = null;
  }

  function getCookbookRecipes(cookbook) {
    let list = (cookbook.recipes || []);
    if (sortMode === 'alpha') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortMode === 'category') {
      list = [...list].sort((a, b) => a.category.localeCompare(b.category));
    }
    return list;
  }

  function printCookbook(cookbook) {
    import('print-js').then(({ default: printJS }) => {
      const recipeList = getCookbookRecipes(cookbook).map(r => `<div class='print-recipe'><h2>${r.title}</h2><div class='print-category'>${r.category}</div><div class='print-instructions'>${r.instructions}</div></div>`).join('');
      printJS({
        printable: `<div class='print-cookbook'><h1>${cookbook.name}</h1>${recipeList}</div>`,
        type: 'raw-html',
        style: '.print-cookbook{font-family:sans-serif;} .print-recipe{margin-bottom:2em;} .print-category{color:#666;} .print-instructions{margin-top:1em;}'
      });
    });
  }

  onMount(() => {
    loadCookbooks();
    loadRecipes();
  });
</script>

<h1>Cookbook Composer</h1>
<div class="cookbook-list">
  {#if cookbooks.length === 0}
    <p>No cookbooks found.</p>
  {/if}
  {#each cookbooks as cookbook}
    <div class="cookbook-card">
      <div class="cookbook-title">{cookbook.name}</div>
      <div class="cookbook-description">{cookbook.description}</div>
      <Button onclick={() => openForm(cookbook)}>Edit</Button>
      <Button onclick={() => removeCookbook(cookbook.id)} color="error">Delete</Button>
      <a class="mdc-button" href="/cookbooks/servings/{cookbook.id}" color="secondary">Servings</a>
      <div class="cookbook-sort">
        <label for="cookbook-sort-select">Sort:</label>
        <Select id="cookbook-sort-select" bind:value={sortMode} class="cookbook-sort-select">
          <Option value="added">Order Added</Option>
          <Option value="alpha">Alphabetical</Option>
          <Option value="category">By Category</Option>
        </Select>
      </div>
      <ul class="cookbook-recipe-list">
        {#each getCookbookRecipes(cookbook) as recipe}
          <li class="cookbook-recipe-item">{recipe.title} <span class="cookbook-recipe-category">({recipe.category})</span></li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
<Button class="add-cookbook" type="button" onclick={() => openForm()}>Add Cookbook</Button>

{#if showForm}
  <div class="cookbook-form">
    <h2>{editing ? 'Edit' : 'Add'} Cookbook</h2>
    <Textfield bind:value={name} label="Cookbook Name" required class="cookbook-name-field" />
    <Textfield bind:value={description} label="Description" class="cookbook-description-field" />
    <label class="cookbook-recipe-label" for="cookbook-recipe-select">Select & Order Recipes:</label>
    <div id="cookbook-recipe-select" class="cookbook-recipe-select">
      {#each getCookbookRecipesByOrder() as recipe, idx}
        <div class="draggable-recipe" draggable="true" role="listitem"
          ondragstart={(e) => handleDragStart(e, idx)}
          ondragover={(e) => handleDragOver(e, idx)}
          ondrop={handleDrop}
          ondragend={handleDragEnd}
        >
          <input type="checkbox" value={recipe.id} bind:group={selectedRecipeIds} />
          {recipe.title}
          <span class="cookbook-recipe-category">({recipe.category})</span>
        </div>
      {/each}
      <!-- Add unchecked recipes -->
      {#each allRecipes.filter(r => !selectedRecipeIds.includes(r.id)) as recipe}
        <label><input type="checkbox" value={recipe.id} bind:group={selectedRecipeIds} /> {recipe.title}</label>
      {/each}
    </div>
    <div class="form-actions">
      <Button onclick={saveCookbook}>{editing ? 'Update' : 'Save'}</Button>
      <Button onclick={closeForm} color="secondary">Cancel</Button>
    </div>
  </div>
{/if}

<style>
  .cookbook-recipe-select{
    display:flex;
    flex-direction: column;
  }
.cookbook-list {
  margin-bottom: 1rem;
}
.cookbook-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 4px;
  background: #f9f9f9;
}
.cookbook-title {
  font-weight: bold;
  font-size: 1.2em;
}
.cookbook-description {
  color: #666;
  margin-bottom: 0.5em;
}
.cookbook-sort {
  margin: 0.5em 0;
  display: flex;
  align-items: center;
  gap: 0.5em;
}
.cookbook-recipe-list {
  margin-top: 0.5em;
  padding-left: 1.2em;
}
.cookbook-recipe-item {
  margin-bottom: 0.2em;
}
.cookbook-recipe-category {
  color: #888;
}
.cookbook-form {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 6px;
  margin-top: 2rem;
}
.cookbook-recipe-label {
  margin-top: 1em;
  font-weight: bold;
}
.cookbook-recipe-select {
  margin-bottom: 1em;
}
.draggable-recipe {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.3em 0.5em;
  border: 1px dashed #bbb;
  border-radius: 4px;
  margin-bottom: 0.3em;
  background: #f5f5f5;
  cursor: grab;
}
.draggable-recipe:active {
  background: #e0e0e0;
}
.form-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
</style>
