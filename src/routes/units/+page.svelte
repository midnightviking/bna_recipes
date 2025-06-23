<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	import { onMount } from 'svelte';
	
	import Textfield from '@smui/textfield';
	
	import Button, { Label } from '@smui/button';
	import IconButton, { Icon } from '@smui/icon-button';
	import Card, {
    Content,
    PrimaryAction,
    Actions,
    ActionButtons,
    ActionIcons,
  	} from '@smui/card';


	let units = $state([]);
	let editing = false;
	let editId = null;
	let showForm = $state(false);

	let name = '';
	let conversion_unit = '';
	let conversion_threshold = '';
	let conversion_formula = '';

	function resetForm() {
		name = '';
		conversion_unit = '';
		conversion_threshold = '';
		conversion_formula = '';
		editing = false;
		editId = null;
	}

	function openForm(unit = null) {
		showForm = true;
		if (unit) {
			editing = true;
			editId = unit.id;
			name = unit.name;
			conversion_unit = unit.conversion_unit;
			conversion_threshold = unit.conversion_threshold ?? '';
			conversion_formula = unit.conversion_formula ?? '';
		} else {
			resetForm();
		}
	}

	function closeForm() {
		showForm = false;
		resetForm();
	}

	async function saveUnit() {
		const payload = { name, conversion_unit, conversion_threshold, conversion_formula };
		if (editing) {
			await fetch('/api/units', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: editId, ...payload })
			});
		} else {
			await fetch('/api/units', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		}
		await loadUnits();
		closeForm();
	}

	async function removeUnit(id) {
		await fetch('/api/units', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		await loadUnits();
	}
	let isLoaded = $state(false);
	async function loadUnits(refresh=false) {
		if(!refresh && isLoaded){
			console.log("already loaded");
			return;
		}
		const res = await fetch('/api/units');
		if (res.ok) {
			units = await res.json();
			isLoaded = true;
		}
		
	}

	onMount(() => {
		loadUnits();
	});
</script>

<h1>Units</h1>
<div class="unit-list">
	<Button class="add-unit" type="button" onclick={() => openForm()}>Add Unit</Button>
	{#if units.length === 0}
		<p>No units found.</p>
	{/if}
	{#each units as unit}
		<Card class="card">
			<Content class="mdc-typography--body2">
				<div class="unit-name">{unit.name}</div>
				<div class="unit-conversion-unit">{unit.conversion_unit}</div>
				<div class="unit-conversion-threshold">Threshold: {unit.conversion_threshold}</div>
				<div class="unit-conversion-formula">Formula: {unit.conversion_formula}</div>
			</Content>
			<Actions>
				<ActionButtons>
				  <Button onclick={() => openForm(unit)}>
					<Label>Edit</Label>
				  </Button>
				  <Button onclick={() => removeUnit(unit.id)} color="error">
					<Label>Delete</Label>
				  </Button>
				</ActionButtons>
				
			  </Actions>
		</Card>
	{/each}
</div>

{#if showForm}
	<div class="unit-form">
		<h2>{editing ? 'Edit' : 'Add'} Unit</h2>
		<Textfield bind:value={name} label="Unit Name" required class="unit-name-field" />
		<Textfield
			bind:value={conversion_unit}
			label="Conversion Unit"
			class="unit-conversion-unit-field"
		/>
		<Textfield
			bind:value={conversion_threshold}
			label="Conversion Threshold"
			type="number"
			class="unit-conversion-threshold-field"
		/>
		<Textfield
			bind:value={conversion_formula}
			label="Conversion Formula"
			class="unit-conversion-formula-field"
		/>
		<div class="form-actions">
			<Button onclick={saveUnit}>{editing ? 'Update' : 'Save'}</Button>
			<Button onclick={closeForm} color="secondary">Cancel</Button>
		</div>
	</div>
{/if}

<style lang="scss">
.card{
	margin-bottom:2rem;
}
</style>
