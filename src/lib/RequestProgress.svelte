<script lang="ts">
  import { SUPPORT_URL } from "@/globals";

  const TOO_LONG_AFTER_MS = 8000;

  let { progress, total }: { progress: number; total: number } = $props();
  let takingTooLong = $state(false);

  $effect(() => {
    progress;
    takingTooLong = false;

    const timeout = setTimeout(() => {
      takingTooLong = true;
    }, TOO_LONG_AFTER_MS);

    return () => clearTimeout(timeout);
  });
</script>

<div class="progress">
  <div class="progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax={total} style="width: {(progress / total) * 100}%">
    {progress} / {total}
  </div>
</div>
{#if takingTooLong}
  <div class="alert alert-info">
    <p><i class="fa fa-info-circle"></i> This is taking too long. BLAEO might be down/under heavy load, your browser might be silently blocking the request or your internet might be slow.</p>
    <p>You can try using a different userscript extension (Violentmonkey or Tampermonkey) or a different browser.</p>
    <p>If it still doesn't work, please report this issue on <a href={SUPPORT_URL}>BLAEO+'s group thread</a> and please share which browser are you using and which userscript extension.</p>
  </div>
{/if}
