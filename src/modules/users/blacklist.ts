import BlacklistButton from "@/modules/users/BlacklistButton.svelte";
import { optionsStore } from "@/lib/store";
import { get } from "svelte/store";
import { blacklistIcon } from "@/assets/icons";

let options = get(optionsStore) as Options;
optionsStore.subscribe((value) => {
  options = value;
  console.log(options);
});

function handlePostBlock(name: string, element: HTMLElement) {
  if (!options.blacklist[name]) {
    return;
  }

  if (options.modules.users.blacklist.postBehavior === "hide") {
    element.style.display = "none";
  } else if (options.modules.users.blacklist.postBehavior === "collapse") {
    element.insertAdjacentHTML(
      "beforebegin",
      `
      <div class="panel-default post blocked collapsed">
        <div class="avatar">${blacklistIcon}</div>
        <div class="body">
          <div class="markdown">
            This post was made by a blacklisted user.
          </div>
        </div>
      </div>`,
    );

    element.previousElementSibling?.querySelector(".btn-uncollapse")?.addEventListener("click", () => {
      element.previousElementSibling?.classList.remove("collapsed");
    });
  } else if (options.modules.users.blacklist.postBehavior === "collapse-with-uncollapse") {
    element.insertAdjacentHTML(
      "beforebegin",
      `
      <div class="panel-default post blocked collapsed">
        <div class="avatar">${blacklistIcon}</div>
        <div class="body">
          <div class="markdown">
            This post was made by a blacklisted user. <button class="btn btn-uncollapse btn-default" type="button">Uncollapse</button>
          </div>
        </div>
      </div>`,
    );

    element.previousElementSibling?.querySelector(".btn-uncollapse")?.addEventListener("click", () => {
      element.previousElementSibling?.classList.remove("collapsed");
    });
  }
}

function handleCommentBlock(name: string, element: HTMLElement) {
  if (!options.blacklist[name]) {
    return;
  }

  if (options.modules.users.blacklist.commentBehavior === "hide" && !element.parentElement?.classList.contains("reply")) {
    element.style.display = "none";
  } else if (options.modules.users.blacklist.commentBehavior === "collapse" || (options.modules.users.blacklist.commentBehavior === "hide" && element.parentElement?.classList.contains("reply"))) {
    element.insertAdjacentHTML(
      "beforebegin",
      `
      <div class="panel-default post blocked collapsed">
        <div class="avatar">${blacklistIcon}</div>
        <div class="body">
          <div class="markdown">
            This comment was made by a blacklisted user.
          </div>
        </div>
      </div>`,
    );

    element.previousElementSibling?.querySelector(".btn-uncollapse")?.addEventListener("click", () => {
      element.previousElementSibling?.classList.remove("collapsed");
    });
  } else if (options.modules.users.blacklist.commentBehavior === "collapse-with-uncollapse") {
    element.insertAdjacentHTML(
      "beforebegin",
      `
      <div class="panel-default post blocked collapsed">
        <div class="avatar">${blacklistIcon}</div>
        <div class="body">
          <div class="markdown">
            This comment was made by a blacklisted user. <button class="btn btn-uncollapse btn-default" type="button">Uncollapse</button>
          </div>
        </div>
      </div>`,
    );

    element.previousElementSibling?.querySelector(".btn-uncollapse")?.addEventListener("click", () => {
      element.previousElementSibling?.classList.remove("collapsed");
    });
  }
}

export default function initBlacklist() {
  const activityFeed = document.querySelector("[data-endless='/feed']") as HTMLElement;
  const comments = Array.from(document.querySelectorAll(".comment")) as HTMLElement[];
  const profiles = Array.from(document.querySelectorAll("[data-endless^='/']")) as HTMLElement[];

  if (activityFeed) {
    const posts = Array.from(activityFeed.querySelectorAll(".post:not(.blocked)")) as HTMLElement[];

    for (let post of posts) {
      const postAuthor = post.querySelector(".body > a[href^='/users/']") as HTMLAnchorElement;
      const postAuthorName = postAuthor.href.match(/\/users\/([\w+]+)$/);

      if (!postAuthorName) {
        continue;
      }

      handlePostBlock(postAuthorName[1], post);
    }

    const activityFeedObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE || !(node as HTMLElement).classList.contains("post") || (node as HTMLElement).classList.contains("blocked")) {
            continue;
          }

          const postAuthor = (node as HTMLElement).querySelector(".body > a[href^='/users/']") as HTMLAnchorElement;
          const postAuthorName = postAuthor.href.match(/\/users\/([\w+]+)$/);

          if (!postAuthorName) {
            continue;
          }

          handlePostBlock(postAuthorName[1], node as HTMLElement);
        }
      }
    });

    activityFeedObserver.observe(activityFeed, { childList: true });
  }

  for (let comment of comments) {
    const commentAuthor = comment.querySelector(".avatar[href^='/users/']") as HTMLAnchorElement;
    const commentAuthorName = commentAuthor.href.match(/\/users\/([\w+]+)$/);

    if (!commentAuthorName) {
      continue;
    }

    handleCommentBlock(commentAuthorName[1], comment);
  }

  for (let profile of profiles) {
    const profileName = profile!.dataset!.endless!.match(/\/users\/([\w+]+)$/);

    if (!profileName) {
      continue;
    }

    const profileToolbar = profile.querySelector(".profile-toolbar") as HTMLElement;

    const blacklistButtonComponent = new BlacklistButton({
      target: profileToolbar,
      props: {
        name: profileName[1],
      },
    });
  }
}
