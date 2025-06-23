<script>
	import Card, {
    Content,
    PrimaryAction,
    Actions,
    ActionButtons,
    ActionIcons,
  } from '@smui/card';
  import Button, { Label } from '@smui/button';
  import IconButton, { Icon } from '@smui/icon-button';

  let {content} = $props();

</script>

<div class="card-container">
    <Card>
      <Content>{children}</Content>
      <Actions>
        <ActionButtons>
          <Button onclick={() => clicked++}>
            <Label>Action</Label>
          </Button>
          <Button onclick={() => clicked++}>
            <Label>Another</Label>
          </Button>
        </ActionButtons>
        <ActionIcons>
          <IconButton
            onclick={() => clicked++}
            toggle
            aria-label="Add to favorites"
            title="Add to favorites"
          >
            <Icon class="material-icons" on>favorite</Icon>
            <Icon class="material-icons">favorite_border</Icon>
          </IconButton>
          <IconButton
            class="material-icons"
            onclick={() => clicked++}
            title="Share">share</IconButton
          >
          <IconButton
            class="material-icons"
            onclick={() => clicked++}
            title="More options">more_vert</IconButton
          >
        </ActionIcons>
      </Actions>
    </Card>
  </div>