<script>
	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	import { onMount } from 'svelte';
	import Button from '@smui/button';
	import Textfield from '@smui/textfield';

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

	async function loadUnits() {
		const res = await fetch('/api/units');
		if (res.ok) {
			units = await res.json();
		}
	}

	onMount(() => {
		loadUnits();
	});
</script>

<h1>Units</h1>
<div class="unit-list">
	{#if units.length === 0}
		<p>No units found.</p>
	{/if}
	{#each units as unit}
		<div class="unit-card">
			<div class="unit-name">{unit.name}</div>
			<div class="unit-conversion-unit">{unit.conversion_unit}</div>
			<div class="unit-conversion-threshold">Threshold: {unit.conversion_threshold}</div>
			<div class="unit-conversion-formula">Formula: {unit.conversion_formula}</div>
			<Button onclick={() => openForm(unit)}>Edit</Button>
			<Button onclick={() => removeUnit(unit.id)} color="error">Delete</Button>
		</div>
	{/each}
</div>
<Button class="add-unit" type="button" onclick={() => openForm()}>Add Unit</Button>
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

<style>
</style>
