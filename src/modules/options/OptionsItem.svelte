<script lang="ts">
  export let title: string;
  export let titleClass: string;
</script>

<details open>
  <summary class={titleClass}>{title}</summary>
  <div class="content">
    <slot />
  </div>
</details>

<style lang="scss">
  details {
    summary {
      display: list-item;
      cursor: pointer;
      line-height: 1.3;
      font-family: Oswald, Arial, sans-serif;
    }

    .content {
      margin-left: 8px;
    }

    &[open] {
      .content {
        animation: details-show 150ms ease-in-out;
      }
    }
  }

  @keyframes details-show {
    from {
      transform: var(--details-translate, translateY(-0.5em));
      opacity: 0;
    }
  }
</style>
