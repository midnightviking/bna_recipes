<script>
  import { onMount } from 'svelte';
  import Button from '@smui/button';
  import Textfield from '@smui/textfield';
  import Select, { Option } from '@smui/select';


  
  let recipes = $state([]);
  let allIngredients = $state([]);
  let units = $state([]);
  let editing = $state(false);
  let editId = null;
  let showForm = $state(false);

  // Recipe fields
  let recipeFormF = $state({
    title : '',
    minTemp : '',
    itemType : '',
    portionSize : '',
    calories : '',
    category : '',
    instructions : '',
    ccp : '',
    substitutions : '',
    initialServings : 100,
    ingredients : [],
  })
  

  // For adding a new ingredient to the recipe
  let newIngredientId = '';
  let newQuantity = '';
  let newUnitId = '';

  const categories = ['Veggies', 'Starches', 'Entrees', 'Dessert'];
  const itemTypes = ['Bread', 'Veggie', 'Soup', 'Entree', 'Dessert'];

  function resetForm() {
    title = '';
    minTemp = '';
    itemType = '';
    portionSize = '';
    calories = '';
    category = '';
    instructions = '';
    ccp = '';
    substitutions = '';
    initialServings = 100;
    ingredients = [];
    editing = false;
    editId = null;
  }

  function openForm(recipe = null) {
    showForm = true;
    if (recipe) {
      editing = true;
      editId = recipe.id;

      recipeFormF = Object.assign(recipe);
      recipeFormF.ingredients = recipe.ingredients ? recipe.ingredients.map(i => ({
        ingredient_id: i.ingredient_id,
        name: i.name,
        quantity: i.quantity,
        unit_id: i.unit_id,
        unit_name: i.unit_name
      })) : [];
    } else {
      resetForm();
    } 
  }

  function closeForm() {
    showForm = false;
    resetForm();
  }

  function addIngredientToRecipe() {
    if (!newIngredientId || !newQuantity || !newUnitId) return;
    const ing = allIngredients.find(i => i.id == newIngredientId);
    const unit = units.find(u => u.id == newUnitId);
    if (!ing || !unit) return;
    // Prevent duplicates
    if (ingredients.some(i => i.ingredient_id == newIngredientId)) return;
    ingredients = [
      ...ingredients,
      {
        ingredient_id: ing.id,
        name: ing.name,
        quantity: newQuantity,
        unit_id: unit.id,
        unit_name: unit.name
      }
    ];
    newIngredientId = '';
    newQuantity = '';
    newUnitId = '';
  }

  function removeIngredientFromRecipe(id) {
    ingredients = ingredients.filter(i => i.ingredient_id !== id);
  }

  async function saveRecipe() {
    const recipe = {
      id: editing ? editId : undefined,
      title,
      minTemp,
      itemType,
      portionSize,
      calories,
      category,
      instructions,
      ccp,
      substitutions,
      initialServings,
      ingredients: ingredients.map(i => ({
        ingredient_id: i.ingredient_id,
        quantity: i.quantity,
        unit_id: i.unit_id
      }))
    };
    if (editing) {
      await fetch('/api/recipes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipe, id: editId })
      });
    } else {
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
      });
    }
    await loadRecipes(true);
    closeForm();
  }

  async function removeRecipe(id) {
    await fetch('/api/recipes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    await loadRecipes(true);
  }

  let isLoadedRecipes = $state(false);
  let isLoadedIngs = $state(false);

  async function loadRecipes(refresh=false) {
    
    if(!refresh && isLoadedRecipes){
      console.log("already loadaed?");
      return;
    }
    const res = await fetch('/api/recipes');
    if (res.ok) {
      recipes = await res.json();
      isLoadedRecipes = true;
    }
  }

  async function loadIngredientsAndUnits(refresh=false) {
    if(!refresh && isLoadedIngs){
      return;
    }
    const [ingRes, unitRes] = await Promise.all([
      fetch('/api/ingredients'),
      fetch('/api/units')
    ]);
    if (ingRes.ok) {
      allIngredients = await ingRes.json();
    }
    if (unitRes.ok) {
      units = await unitRes.json();
    }

    isLoadedIngs = true;
  }

  onMount(async () => {
    await loadRecipes();
    await loadIngredientsAndUnits();
    
  });

</script>

<h1>Recipes</h1>
<div class="recipe-list">
  {#if recipes.length === 0}
    <p>No recipes found.</p>
  {/if}
  {#each recipes as recipe}
    
    <div class="recipe-card">
      <div class="recipe-title">{recipe.title}</div>
      <div class="recipe-category">{recipe.category}</div>
      <Button onclick={() => openForm(recipe)}>Edit</Button>
      <Button onclick={() => removeRecipe(recipe.id)} color="error">Delete</Button>
    </div>
  {/each}
</div>
<Button class="add-recipe" type="button" onclick={() => openForm()}>Add Recipe</Button>

{#if showForm}
  <div class="recipe-form">
    <h2>{editing ? 'Edit' : 'Add'} Recipe</h2>
    <Textfield bind:value={recipeFormF.title} label="Title" required class="recipe-title-field" />
    <Textfield bind:value={recipeFormF.minTemp} label="Minimum Temp (F)" type="number" class="recipe-min-temp-field" />
    <Select bind:value={recipeFormF.itemType} label="Item Type" class="recipe-item-type-field">
      <Option value="" disabled selected>Select type</Option>
      {#each itemTypes as type}
        <Option value={type}>{type}</Option>
      {/each}
    </Select>
    <Textfield bind:value={recipeFormF.portionSize} label="Portion Size" class="recipe-portion-size-field" />
    <Textfield bind:value={recipeFormF.calories} label="Calories" type="number" class="recipe-calories-field" />
    <Select bind:value={recipeFormF.category} label="Category" class="recipe-category-field">
      <Option value="" disabled selected>Select category</Option>
      {#each categories as cat}
        <Option value={cat}>{cat}</Option>
      {/each}
    </Select>
    <Textfield bind:value={recipeFormF.instructions} label="Cooking Instructions" textarea class="recipe-instructions-field" />
    <Textfield bind:value={recipeFormF.ccp} label="Critical Control Point (CCP)" class="recipe-ccp-field" />
    <Textfield bind:value={recipeFormF.substitutions} label="Substitutions" class="recipe-substitutions-field" />
    <Textfield bind:value={recipeFormF.initialServings} label="Initial Servings Size" type="number" class="recipe-initial-servings-field" />
    <div class="recipe-ingredients-section">
      <h3>Ingredients</h3>
      <div class="add-ingredient-row">
        <Select bind:value={newIngredientId} label="Ingredient">
          <Option value="">Select ingredient</Option>
          {#each allIngredients as ing}
            <Option value={ing.id}>{ing.name}</Option>
          {/each}
        </Select>
        <Textfield bind:value={newQuantity} label="Quantity" type="number" min="0" />
        <Select bind:value={newUnitId} label="Unit">
          <Option value="">Select unit</Option>
          {#each units as u}
            <Option value={u.id}>{u.name}</Option>
          {/each}
        </Select>
        <Button onclick={addIngredientToRecipe}>Add</Button>
      </div>
      <ul class="recipe-ingredient-list">
        {#each recipeFormF.ingredients as ing}
          <li>
            {ing.name} - {ing.quantity} {ing.unit_name}
            <Button onclick={() => removeIngredientFromRecipe(ing.ingredient_id)} color="error">Remove</Button>
          </li>
        {/each}
      </ul>
    </div>
    <div class="form-actions">
      <Button onclick={saveRecipe}>{editing ? 'Update' : 'Save'}</Button>
      <Button onclick={closeForm} color="secondary">Cancel</Button>
    </div>
  </div>
{/if}

<style>
.recipe-list {
  margin-bottom: 2rem;
 }

 .recipe-form{
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 6px;
  max-width: 700px;
  margin-top: 2rem;

 }
 * :global(.mdc-select),
 * :global(.mdc-text-field) {
  margin-bottom:1rem;
  width:100%;
 }
/*.recipe-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.recipe-title {
  font-weight: bold;
  flex: 1;
}
.recipe-category {
  color: #666;
  flex: 1;
}
.recipe-form {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 1.5rem;
  border-radius: 6px;
  max-width: 500px;
  margin-top: 2rem;
}
.form-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}
.recipe-ingredients-section {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
.add-ingredient-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}
.recipe-ingredient-list {
  list-style: disc;
  margin-left: 1.5rem;
} */
</style>
