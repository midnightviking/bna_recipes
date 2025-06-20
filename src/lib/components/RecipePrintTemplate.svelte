<script>
    import Paper, { Title, Content } from '@smui/paper';
    import DataTable, { Head, Body, Row, Cell, Label } from '@smui/data-table';
	import { onMount } from 'svelte';
	  

    let {recipe, scale, db_units} = $props();

  const calculateServings = (_yield, value, unit_name=null)=>{
    let y = _yield/recipe.initialServings;
    let display_unit = unit_name ?? "";
    if(db_units && unit_name!== null){
      const unitInfo = db_units?.find(u => u.name === unit_name);
      if (unitInfo && unitInfo.conversion_unit && unitInfo.conversion_threshold && unitInfo.conversion_formula) {
        if ((y * value) >= unitInfo.conversion_threshold) {
          // Convert to the new unit
          value = (y * value) / unitInfo.conversion_formula;
          display_unit = unitInfo.conversion_unit;
          y = 1; // Already scaled
        }
      } 
    }
    // display_unit = (display_unit !== "")? `<span><sup>${display_unit}</sup></span>`:"";
    let result = (Math.round((y * value) * 4) / 4) + " " + display_unit ;
    return result;
  }

  onMount(()=>{
    
  })

</script>

<div class="recipe-template" style="width:fit-content;" id="print-recipe-{recipe.title}">
  
  <h3 class="recipe-title" >{recipe.title}</h3>

    <div class="info-area">
      <ul>
        {#if recipe.portionSize}
          <li>
            <h3>Portion Size:</h3>
            <span>{recipe.portionSize}</span>          
          </li>
        {/if}
        {#if recipe.minTemp}
          <li>
            <h3>Min. Temp:</h3>
            <span>{recipe.minTemp}</span>          
          </li>
        {/if}
        {#if recipe.itemType}
          <li>
            <h3>Item Type:</h3>
            <span>{recipe.itemType}</span>          
          </li>
        {/if}
        {#if recipe.calories}          
          <li>
            <h3>Calories:</h3>
            <span>{recipe.calories}</span>   
          </li>
        {/if}
      </ul>
    </div>

    <div class="ingredients">
      <DataTable square style="box-shadow:none;">
        <Head class="yieldHead">
          <Row>
            <Cell style="background-color:inherit;"></Cell>
            <Cell style="background-color:inherit;"><Label>Yield:</Label></Cell>
            {#each scale as servings}
              <Cell style="" >
                <Label>
                  {servings}
                </Label>
              </Cell>
            {/each}
          </Row>
        </Head>
        <Head>
          <Row>
            <Cell style="width:100%" >
              <Label >
                Ingredients
              </Label>
            </Cell>
            <Cell>
              <Label>
              Unit
              </Label>
            </Cell>
            {#each scale as servings}
              <Cell>
                QTY
              </Cell>
            {/each}
          </Row>
      </Head>
      {#each recipe.ingredients as ingredient}
        <Row>
          <Cell style="text-align:left">{ingredient.name}</Cell>
          <Cell>{ingredient.unit_name}</Cell>
          {#each scale as servings,i}
            <Cell >
              {                  
                calculateServings(servings, ingredient.quantity, (i!==0)?ingredient.unit_name:null)
              }
            </Cell>
          {/each}
        </Row>
      {/each}
      </DataTable>
    </div>

    <div class="recipe-block">
      <div class="block-header">
        <h4>
          Cooking Notes:
        </h4>
      </div>
      <div class="block-content">
          {recipe.instructions}
      </div>
    </div>

    <div class="recipe-block">
      <div class="block-header">
        <h4>
          Critical Control Point (CCP):
        </h4>
      </div>
      <div class="block-content">
          {recipe.ccp}
      </div>
    </div>

    <div class="recipe-block">
      <div class="block-header">
        <h4>
          substitutions:
        </h4>
      </div>
      <div class="block-content" style="padding:0;">
          {recipe.substitutions}
      </div>
    </div>
  </div>
<style lang="scss">
  .recipe-template{
    display: inline-block;
    width:fit-content;
    width:100vw;
    padding:0.25rem;
    border-bottom:3px dotted black; 
    margin-bottom:2rem;
    padding-bottom:2rem;
    // font-family:"Aptos Narrow", "Roboto";
    .recipe-title{
      font-size:1.5rem;
      margin:0.35em 0;
    }
  }
  .info-area{
    margin:1.5rem 0;
    width:fit-content;
    
    ul{
      margin:0;
      padding: 0;
      font-size:0.87rem;
      display: flex;
      gap:1.5rem;

      li{
        display: flex;
        gap:1rem;
        align-items: center;
        justify-items: start;
        justify-content: flex-start;
        padding:0.2rem 1rem;
        height: 30px;
        
        h3{
          font-size:0.95rem;
          // font-size:1.1rem;
          padding:0;
          margin:0;
          min-width: 100px;
          line-height:2rem;
          font-weight: bold;
        }

        &:nth-child(even){
          background:rgba(0,0,0,0.15);
        }

        &:first-child{
          padding-left:0.2rem;
        }
      }
    }
  }

  .ingredients{
    // border-bottom:2px solid rgba(0,0,0,0.8);
  }
  
  .recipe-block{
    .block-header{
      background:rgba(0,0,0,0.15);
      padding:0.1rem 0.5rem;
      border:1px solid rgba(0,0,0,0.7);
      border-bottom:2px double rgba(0,0,0,0.7);
      margin-top:1.15rem;
      h4{
        font-weight: bold;
        font-size:0.9rem;
        padding:0.15rem 0;
        margin:0;
      }
    }
    .block-content{
      padding:.2rem .25rem;
    }
  }
  
  @media print {
    @page {
      size: letter landscape;
      margin: 6cm 4cm;
    }
    
  }
</style>