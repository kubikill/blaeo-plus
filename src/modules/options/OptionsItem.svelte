<script>
  export let title;
  export let titleClass;
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
      font-family: Oswald, Arial, sans-serif;
      line-height: 1.3;
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
      opacity: 0;
      transform: var(--details-translate, translateY(-0.5em));
    }
  }
</style>
