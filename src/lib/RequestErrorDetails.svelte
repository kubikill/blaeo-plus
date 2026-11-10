<script lang="ts">
  import { SUPPORT_URL } from "@/globals";

  let { error }: { error: any } = $props();
</script>

<p>Status: {error?.status ?? ""} {error?.statusText ?? ""}</p>
<pre><code>{error?.responseText || error?.message || error?.error || "No further details are available."}</code></pre>
<p>If this problem continues, please report this issue on <a href={SUPPORT_URL}>BLAEO+'s group thread</a> and share the error details.</p>
