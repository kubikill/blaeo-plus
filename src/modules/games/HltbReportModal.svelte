<script lang="ts">
  import Modal from "@/lib/Modal.svelte";
  import { reportHltbId, reportNotAGame } from "@/lib/hltbService";

  type ReportKind = "hltb-id" | "not-a-game";

  let isOpen = $state(false);
  let steamId = $state(0);
  let gameName = $state("");
  let currentHltbId: number | null = $state(null);

  let kind = $state<ReportKind>("hltb-id");
  let hltbInput = $state("");
  let status: "editing" | "sending" | "sent" = $state("editing");
  let errorMessage = $state("");

  export function open(game: { steamId: number; name: string; hltbId: number | null }) {
    steamId = game.steamId;
    gameName = game.name;
    currentHltbId = game.hltbId;
    kind = "hltb-id";
    hltbInput = "";
    status = "editing";
    errorMessage = "";
    isOpen = true;
  }

  function parseHltbId(input: string): number | null {
    const match = input.trim().match(/^(?:(?:https?:\/\/)?(?:www\.)?howlongtobeat\.com\/game\/)?(\d+)(?:[/?#].*)?$/i);
    const id = match ? Number(match[1]) : NaN;

    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  const suggestedHltbId = $derived(parseHltbId(hltbInput));
  const hltbInputProblem = $derived(
    hltbInput.trim() === ""
      ? ""
      : suggestedHltbId === null
        ? "That doesn't look like an HLTB game link, e.g. https://howlongtobeat.com/game/12345"
        : suggestedHltbId === currentHltbId
          ? "That's already the current HLTB link for this game."
          : "",
  );
  const canSubmit = $derived(status === "editing" && (kind === "not-a-game" || (suggestedHltbId !== null && !hltbInputProblem)));

  async function submit() {
    if (!canSubmit) {
      return;
    }

    status = "sending";
    errorMessage = "";

    try {
      if (kind === "hltb-id") {
        await reportHltbId(steamId, suggestedHltbId!);
      } else {
        await reportNotAGame(steamId);
      }

      status = "sent";
    } catch (error: any) {
      status = "editing";
      errorMessage = error?.status === 429 ? "You've sent a lot of reports recently. Please try again in a while." : `Sending the report failed${error?.status ? ` (${error.status})` : ""}. Please try again later.`;
    }
  }
</script>

<Modal class="bp-hltb-report-modal" title="Report HLTB data for {gameName}" bind:open={isOpen}>
  {#if status === "sent"}
    <p class="alert alert-success">Thanks! Your report was sent and will be reviewed soon.</p>
  {:else}
    <div class="btn-group bp-report-kinds" role="group" aria-label="What's wrong?">
      <button type="button" class="btn btn-default" class:active={kind === "hltb-id"} onclick={() => (kind = "hltb-id")}>Wrong or missing HLTB link</button>
      <button type="button" class="btn btn-default" class:active={kind === "not-a-game"} onclick={() => (kind = "not-a-game")}>Not a game / is a demo/playtest</button>
    </div>

    {#if kind === "hltb-id"}
      <p>
        Current HLTB link:
        {#if currentHltbId}
          <a href="https://howlongtobeat.com/game/{currentHltbId}" target="_blank" rel="noopener noreferrer">howlongtobeat.com/game/{currentHltbId}</a>
        {:else}
          none (shown as not on HLTB)
        {/if}
      </p>
      <form onsubmit={(event) => (event.preventDefault(), submit())}>
        <label for="bp-hltb-report-link">Correct HLTB link:</label>
        <input id="bp-hltb-report-link" class="form-control" type="text" placeholder="https://howlongtobeat.com/game/12345" autocomplete="off" bind:value={hltbInput} />
        {#if hltbInputProblem}
          <p class="text-danger">{hltbInputProblem}</p>
        {/if}
      </form>
    {:else}
      <p>Use this for Steam apps that aren't games, like software or videos, or games that are demos/playtests.</p>
    {/if}

    {#if errorMessage}
      <p class="alert alert-danger">{errorMessage}</p>
    {/if}
  {/if}

  {#snippet footer()}
    {#if status === "sent"}
      <button type="button" class="btn btn-default" onclick={() => (isOpen = false)}>Close</button>
    {:else}
      <button type="button" class="btn btn-default" onclick={() => (isOpen = false)}>Cancel</button>
      <button type="button" class="btn btn-primary" disabled={!canSubmit} onclick={submit}>{status === "sending" ? "Sending…" : "Send report"}</button>
    {/if}
  {/snippet}
</Modal>

<style lang="scss">
  .bp-report-kinds {
    display: flex;
    margin-bottom: 16px;

    .btn {
      flex: 1;
    }
  }

  label {
    font-weight: 400;
  }

  .text-danger {
    margin: 6px 0 0;
  }

  .alert {
    margin: 12px 0 0;
  }
</style>
