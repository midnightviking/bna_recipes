<script>
  import { onMount } from 'svelte';
  import Button from '@smui/button';
  import Textfield from '@smui/textfield';
  import Select from '@smui/select';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';

  let ingredients = [];
  let editing = false;
  let editId = null;
  let showForm = false;

  let name = '';

  function resetForm() {
    name = '';
    editing = false;
    editId = null;
  }

  function openForm(ingredient = null) {
    showForm = true;
    if (ingredient) {
      editing = true;
      editId = ingredient.id;
      name = ingredient.name;
      
    } else {
      resetForm();
    }
  }

  function closeForm() {
    showForm = false;
    resetForm();
  }

  async function saveIngredient() {
    if (editing) {
      await fetch('/api/ingredients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, name })
      });
    } else {
      await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
    }
    await loadIngredients();
    closeForm();
  }

  async function removeIngredient(id) {
    await fetch('/api/ingredients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    await loadIngredients();
  }

  async function loadIngredients() {
    const res = await fetch('/api/ingredients');
    if (res.ok) {
      ingredients = await res.json();
    }
  }

  onMount(() => {
    loadIngredients();
  });
</script>

<h1>Ingredients</h1>
<div class="ingredient-list">
  {#if ingredients.length === 0}
    <p>No ingredients found.</p>
  {/if}
  {#each ingredients as ingredient}
    <div class="ingredient-card">
      <div class="ingredient-name">{ingredient.name}</div>
      <Button onclick={() => openForm(ingredient)}>Edit</Button>
      <Button onclick={() => removeIngredient(ingredient.id)} color="error">Delete</Button>
    </div>
  {/each}
</div>
<Button class="add-ingredient" type="button" onclick={() => openForm()}>Add Ingredient</Button>
{#if showForm}
  <div class="ingredient-form">
    <h2>{editing ? 'Edit' : 'Add'} Ingredient</h2>
    <Textfield bind:value={name} label="Ingredient Name" required class="ingredient-name-field" />
    <div class="form-actions">
      <Button onclick={saveIngredient}>{editing ? 'Update' : 'Save'}</Button>
      <Button onclick={closeForm} color="secondary">Cancel</Button>
    </div>
  </div>
{/if}



<style>
/* .ingredient-list {
  margin-bottom: 2rem;
}
.ingredient-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.ingredient-name {
  font-weight: bold;
  flex: 1;
}
.ingredient-unit {
  color: #666;
  flex: 1;
}
.ingredient-form {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 6px;
  max-width: 400px;
  margin-top: 2rem;
}
.form-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
} */
</style>
