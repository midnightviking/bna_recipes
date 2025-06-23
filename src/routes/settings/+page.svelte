<script>
	import Button from "@smui/button";
  import recipe_import from "$lib/recipe_import.json";
	import { onMount } from "svelte";
  
  let display = "";
  let units = $state([]);
  let ingredients = $state([]);
  let recipes = $state([]);

  let db_units = $state([]);
  let db_ingredients = $state([]);

  const unitConversion = (uc)=>{
    uc = uc.toLowerCase().trim();
    let ret = uc;
    switch(uc){
      case "#10":
      case "#10 can":
      case "#10 cans":
        ret = "#10";
        break;

      case "bag":
      case "bags":
        ret = "bag";
        break;

      case "can":
      case "cans":
        ret= "cans";

      case "cup":
      case "cups":
        ret = "cups";
        break;

      case "gal":
      case "gals":
        ret = "gal";
        break;

      case "qt":
      case "qts":
        ret = "qts";
        break;

      case "tbs":
      case "tbsp":
        ret = "tbsp";
        break;

      case "unit":
        ret ="";
        break;

      case "oz":
      case "ounces":
        ret = "oz";
        break;
      
      case "lbs":
      case "lb":
        ret = "lbs"
        break;

      case "tsp":
        ret ="tsp";
        break;

      default:
        break;   

    }

    return ret;
  }

  const standardizeIngredients = (ingredient) => {
    // Remove punctuation, convert to lowercase, and trim extra spaces
    let ing = ingredient.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().trim();

    switch (ing) {
      case "bbq sauce":
        return "BBQ Sauce";
      case "beans":
        return "Beans";
      case "biscuit mix":
        return "Biscuit Mix";
      case "blackened seasoning":
      case "blackened spice":
      case "blackened spice cajun":
        return "Blackened Seasoning";
      case "brown gravy":
      case "brown gravy mix":
      case "brown gravy mix as directed":
        return "Brown Gravy Mix";
      case "beef steak bites":
      case "steak bites":
        return "Beef Steak Bites";
      case "bell pepper diced":
      case "bell peppers diced":
      case "green pepper diced":
      case "green pepper chopped":
        return "Bell Pepper (Diced)";
      case "green pepper":
        return "Green Pepper";
      case "black pepper":
        return "Black Pepper";
      case "breadroll mix":
        return "Bread/Roll Mix";
      case "broccoli":
        return "Broccoli";
      case "carrots diced":
        return "Carrots (Diced)";
      case "carrots":
        return "Carrots";
      case "celery":
      case "celery chopped":
      case "celery diced":
        return "Celery (Diced)";
      case "cereal":
        return "Cereal";
      case "cheese sauce":
        return "Cheese Sauce";
      case "cheese sauce mix":
        return "Cheese Sauce Mix";
      case "chocolate pudding":
        return "Chocolate Pudding";
      case "cinnamon":
        return "Cinnamon";
      case "cabbage with separate color":
        return "Cabbage";
      case "charbroil patty":
        return "Charbroil Patty";
      case "chicken stripchunks":
        return "Chicken Strip/Chunks";
      case "chili powder":
        return "Chili Powder";
      case "chuckwagon patty":
        return "Chuckwagon Patty";
      case "corn":
        return "Corn";
      case "cornbread cubed":
        return "Cornbread Cubed";
      case "corn bread mix":
      case "cornbread mix":
        return "Cornbread Mix";
      case "diced chicken":
        return "Diced Chicken";
      case "dinner loaf":
        return "Dinner Loaf";
      case "ends and pieces":
      case "ends pieces":
        return "Ends/Pieces";
      case "flour":
        return "Flour";
      case "garlic":
        return "Garlic";
      case "granulated garlic":
        return "Granulated Garlic";
      case "garlic powder":
        return "Garlic Powder";
      case "gravy mix":
        return "Gravy Mix";
      case "green beans":
        return "Green Beans";
      case "grits":
        return "Grits";
      case "ground turkey mst":
        return "Ground Turkey (MST)";
      case "hot dog":
        return "Hot Dog";
      case "italian seasoning":
        return "Italian Seasoning";
      case "ingredient":
        return "";
      case "italian dressing":
        return "Italian Dressing";
      case "ketchup":
        return "Ketchup";
      case "liquid eggs":
        return "Liquid Eggs";
      case "macaroni":
      case "macaroni cooked and drained":
      case "macaroni cooked drained":
        return "Macaroni (Cooked & Drained)";
      case "macaroni cookeddrainedcooled":
        return "Macaroni (Cooked, Drained & Cooled)";
      case "marg":
      case "margarine":
        return "Margarine";
      case "mixed vegetables":
        return "Mixed Vegetables";
      case "mst":
        return "MST";
      case "mayo salad dressing":
      case "mayosalad dressing":
        return "Mayo/Salad Dressing";
      case "meatballs":
        return "Meatballs";
      case "meatloaf patty":
        return "Meatloaf Patty";
      case "muffin mix":
        return "Muffin Mix";
      case "noodles cookeddrainedcooled":
        return "Noodles (Cooked/Drained/Cooled)";
      case "oats":
        return "Oats";
      case "oatmeal":
        return "Oatmeal";
      case "onion":
        return "Onion";
      case "onion chopped":
        return "Onion Chopped";
      case "onion diced":
      case "onions diced":
        return "Onion (Diced)";
      case "peanut butter":
        return "Peanut Butter";
      case "peas":
        return "Peas";
      case "pepper":
        return "Pepper";
      case "pepper gravy mix as directed":
      case "pepper gravy mix":
      case "peppered gravy mix":
        return "Pepper Gravy Mix";
      case "pinto beans":
        return "Pinto Beans";
      case "potatoes":
      case "potatoes fresh":
      case "potatoes diced":
        return "Potatoes (Diced)";
      case "potatoes diced cooked drained":
      case "potatoes diced cooked  drained":
        return "Potatoes (Diced, Cooked & Drained)";
      case "potato flakes dehydrated":
        return "Potato Flakes (Dehydrated)";
      case "potato shredded dehydrated":
        return "Potato Shredded (Dehydrated)";
      case "potato slices dehydrated":
        return "Potato Slices (Dehydrated)";
      case "poultry gravy":
      case "poultry gravy mix":
      case "poultry gravy mix as directed":
      case "poultrygravy mix as directed":
        return "Poultry Gravy Mix";
      case "poultry seasoning":
        return "Poultry Seasoning";
      case "preseason taco meat":
        return "Preseasoned Taco Meat";
      case "rice":
        return "Rice";
      case "salad dressing":
        return "Salad Dressing";
      case "salsa":
        return "Salsa";
      case "salt":
        return "Salt";
      case "sausage links":
        return "Sausage Links";
      case "soy sauce":
        return "Soy Sauce";
      case "syrup":
        return "Syrup";
      case "shredded potatoes dehydrated":
        return "Shredded Potatoes (Dehydrated)";
      case "spaghetti noodles":
        return "Spaghetti Noodles";
      case "sugar cookie mix":
        return "Sugar Cookie Mix";
      case "sweet sour sauce":
      case "sweet  sour sauce":
        return "Sweet & Sour Sauce";
      case "taco seasoning":
        return "Taco Seasoning";
      case "tomato paste":
        return "Tomato Paste";
      case "tomato sauce":
        return "Tomato Sauce";
      case "tomato whole":
      case "tomatoes whole":
        return "Tomatoes Whole";
      case "turkey ends pieces":
      case "turkey end pieces":
      case "turkey ends  pieces":
      case "turkey end  pieces":
      case "turkey endspieces":
      case "endspieces":
        return "Turkey Ends & Pieces";
      case "turkey ham diced":
        return "Turkey Ham, Diced";
      case "vanilla":
        return "Vanilla";
      case "vinegar":
        return "Vinegar";
      case "white vinegar":
        return "White Vinegar";
      case "water":
      case "water pasta":
      case "water sauce":
        return "Water";
      case "water cold":
      case "water  cold":
        return "Water (Cold)";
      case "water 100 degree":
        return "Water (100 Degrees)";
      case "water for cheese sauce":
        return "Water For Cheese Sauce";
      case "water for gravy mix":
        return "Water For Gravy Mix";
      case "water hot":
        return "Water (Hot)";
      case "white cake mix":
        return "White Cake Mix";
      case "whole eggs":
        return "Whole Eggs";
      case "yellow cake mix":
        return "Yellow Cake Mix";
      case "yellow mustard":
        return "Yellow Mustard";
      case "lettuce shredded":
        return "Lettuce (Shredded)";
      case "white sugar use syrup":
        return "White Sugar";
      case "worcestershire":
        return "Worcestershire"
      case "powdered sugar":
      case "POWDERED SUGAR":
        return "Powdered Sugar";
      case "pancake mix":
        return "Pancake Mix";
      default:
        console.log("Should be: ", ingredient);
        console.log("But got: ", ing);
        return "NO MATCH" + ing.toUpperCase();
    }
  }
  

  const importJson =()=>{
    ingredients = [];
    recipes = [];
    recipe_import.forEach((r)=>{
      let _recipe = {};

      _recipe.title = r.title;
      _recipe.minTemp = r.min_temp
      _recipe.itemType = r.item_type
      _recipe.portionSize = r.portion_size
      _recipe.calories = r.calories
      _recipe.category = r.recipe_type;
      _recipe.instructions = r.cooking_notes;
      _recipe.ccp = r.critical_control_point;
      _recipe.substitutions = r.substitutions;
      _recipe.initialServings = 100;
      _recipe.ingredients = [];
      /* ingredients: ingredients.map(i => ({
        ingredient_id: i.ingredient_id,
        quantity: i.quantity,
        unit_id: i.unit_id
      })) */
      //gonna extract the units first, then ingredients and standardize them
      let _i = [];
      r.ingredients.forEach((ing)=>{
        let ri ={};
        let _name = standardizeIngredients(ing[0]);
        let _unit = unitConversion(ing[2]);
        ri.ingredient_id = db_ingredients.find(db_ing => db_ing.name === _name)?.id;
        ri.unit_id = db_units.find(uid=>uid.name===_unit )?.id;
        ri.quantity = ing[1];
        _i.push(ri);
        ingredients.push(_name);
        units.push(_unit);
      });
      _recipe.ingredients = _i;
      recipes.push(_recipe);



    });


    let s = new Set(units);
    units = [...s].sort();
/*     units.forEach(async (unit) => {
      if (unit) {
        await fetch('/api/units', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: unit })
        });
      }
    }); */


    s = new Set(ingredients);
    ingredients = [...s]?.sort();

    /* ingredients.forEach(async (ing)=>{
      await fetch('/api/ingredients', {
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body:JSON.stringify({name: ing})
      });
    }); */

    /* recipes.forEach(async(r)=>{
      await fetch('/api/recipes',{
        method: 'POST',
        header: {'Content-Type': 'application/json'},
        body: JSON.stringify(r)
      }); 
    }); */

    

   

  }
  onMount(async ()=>{
    console.clear();
    db_units = await fetch('/api/units').then((res)=>{
      return res.json();
    });
    db_ingredients = await fetch('/api/ingredients').then((res)=>{
      return res.json();
    });    
   });

   function getIngName(rid){
    return db_ingredients.find(ding=>ding.id === rid)?.name;

   }

</script>

<h1>Settings</h1>
<div class="settings-content">
  <h2>App Settings</h2>
  <p>Settings options will be available here in the future.</p>
  <Button onclick={importJson}>Import</Button>
  <ul>

    {#each recipes as recipe}
      <li>{recipe.title}</li>
      {#each recipe.ingredients as rind}
        <ul>
          <li>{getIngName(rind.ingredient_id)}</li>
        </ul>
      {/each}
    
    {/each}
  </ul>
</div>

<style>
.settings-content {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 2rem;
  border-radius: 6px;
  max-width: 500px;
  margin-top: 2rem;
}
</style>
