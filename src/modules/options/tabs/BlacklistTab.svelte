<script lang="ts">
  import { optionsStore } from "@/lib/store";

  function removeFromBlacklist(event: MouseEvent) {
    const target = event.target as HTMLButtonElement;

    if (target.classList.contains("confirm")) {
      delete $optionsStore.blacklist[target.dataset.name];
      $optionsStore = $optionsStore;
    } else {
      target.classList.add("confirm");
      setTimeout(() => {
        target.classList.remove("confirm");
      }, 3000);
    }
  }
</script>

<div class="main">
  <p>Notes are saved as you type.</p>

  <div class="markdown">
    <table>
      <colgroup>
        <col />
        <col />
        <col style="width: 135px" />
      </colgroup>
      <thead>
        <tr>
          <th>Name</th>
          <th>Note</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.entries($optionsStore.blacklist) as [name, data]}
          <tr>
            <td><a href="https://www.backlog-assassins.net/users/{name}">{name}</a></td>
            <td>
              <textarea class="form-control" bind:value={$optionsStore.blacklist[name].note} />
            </td>
            <td>
              <button type="button" class="btn btn-danger" data-name={name} on:click={removeFromBlacklist}>
                <span class="confirm-message">Are you sure?</span>
                <span class="normal-message">Remove</span>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style lang="scss">
  .confirm-message {
    display: none;
  }

  button:global(.confirm) {
    .confirm-message {
      display: inline-block;
    }
    .normal-message {
      display: none;
    }
  }

  span {
    pointer-events: none;
  }
</style>
