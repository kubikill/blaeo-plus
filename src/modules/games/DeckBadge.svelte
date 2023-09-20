<script lang="ts">
  import { deckPlayable, deckUnsupported, deckUntested, deckVerified } from "@/assets/icons";
  import DeckModal from "./DeckModal.svelte";

  export let gameData: LinuxData;
  export let gameName: string;
  export let modal: DeckModal;

  const badges = {
    unknown: "",
    untested: deckUntested,
    unsupported: deckUnsupported,
    playable: deckPlayable,
    verified: deckVerified,
  };

  function openModal() {
    modal.$set({ gameData: gameData, gameName: gameName, showModal: true });
  }
</script>

<button class="bp-deckverified-{gameData.deckRating}" title="View rating details" aria-label="View rating details" on:click={openModal}>
  {@html badges[gameData.deckRating]}
</button>

<style lang="scss">
  button {
    appearance: none;
    border: none;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
  }
</style>
