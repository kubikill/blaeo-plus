<script lang="ts">
  import { BP_VERSION } from "@/globals";
  import { blaeoPlusLogo } from "@/assets/icons";
</script>

<div class="main">
  {@html blaeoPlusLogo}
  <div class="content">
    <h2>BLAEO+ v{BP_VERSION}</h2>
    <p class="author">Made by <a href="https://steamcommunity.com/id/kubikill/" rel="noopener">kubikill</a></p>
    <p><a href="https://github.com/kubikill/blaeo-plus" rel="noopener">Source code on GitHub</a></p>
    <p><a href="https://steamcommunity.com/groups/attackyourbacklog/discussions/1/7155698768546603592/" rel="noopener">Thread on BLAEO Steam group</a> <br />(report bugs, suggestions and feedback there)</p>
  </div>
</div>

<style lang="scss">
  .main {
    text-align: center;
  }
  .main > :global(svg) {
    height: 100px;
    transition: transform 0.5s ease-out;

    &:hover {
      transform: rotateY(180deg);
    }
  }

  h2 {
    margin: 0 0 4px;
  }

  .author {
    font-size: 16px;
  }
</style>
