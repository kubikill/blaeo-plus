<script>
  import { GM_getValue } from "vite-plugin-monkey/dist/client";

  let saves = GM_getValue("post-saves", []);
  let autosaves = GM_getValue("post-autosaves", []);
</script>

<div class="dropdown">
  <button type="button" class="btn btn-default" data-target="#" data-toggle="dropdown" aria-expanded="false"
    >Load <span class="caret" />
  </button>
  <ul class="dropdown-menu">
    {#each saves as save, index}
      <li>
        <button type="button" data-blaeops_slot={index} data-toggle="modal" data-target="#BLAEOPS_loadmodal"
          >Save {index} - {save.name}
        </button>
      </li>
    {/each}

    {#each autosaves as save, index}
      <li>
        <button type="button" data-blaeops_slot={index} data-toggle="modal" data-target="#BLAEOPS_loadmodal"
          >Autosave {index} - {save.name}
        </button>
      </li>
    {/each}
  </ul>
</div>
