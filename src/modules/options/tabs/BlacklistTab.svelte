<script lang="ts">
  import { options } from "@/lib/store.svelte";

  function removeFromBlacklist(event: MouseEvent) {
    const target = event.target as HTMLButtonElement;

    if (target.classList.contains("confirm")) {
      if (!target.dataset.name) {
        return;
      }

      delete options.blacklist[target.dataset.name];
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
        {#each Object.entries(options.blacklist) as [name, data]}
          <tr>
            <td><a href="https://www.backlog-assassins.net/users/{name}">{name}</a></td>
            <td>
              <textarea class="form-control" bind:value={options.blacklist[name].note}></textarea>
            </td>
            <td>
              <button type="button" class="btn btn-danger" data-name={name} onclick={removeFromBlacklist}>
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
