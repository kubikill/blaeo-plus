import BlacklistButton from "@/modules/users/BlacklistButton.svelte";
import { options } from "@/lib/store.svelte";
import { blacklistIcon } from "@/assets/icons";
import { mountTracked } from "@/globals";
import { removeAllNodesIfExist } from "@/lib/utilities";

type BlockBehavior = Options["modules"]["users"]["blacklist"]["postBehavior"];

function getUserNameFromLink(link: HTMLAnchorElement | null): string | null {
  return link?.href.match(/\/users\/([\w+]+)$/)?.[1] ?? null;
}

function insertBlockedNotice(element: HTMLElement, kind: "post" | "comment", withUncollapseButton: boolean) {
  const uncollapseButton = withUncollapseButton ? ` <button class="btn btn-uncollapse btn-default" type="button">Uncollapse</button>` : "";

  element.insertAdjacentHTML(
    "beforebegin",
    `
      <div class="bp-blacklist panel-default post blocked collapsed">
        <div class="avatar">${blacklistIcon}</div>
        <div class="body">
          <div class="markdown">
            This ${kind} was made by a blacklisted user.${uncollapseButton}
          </div>
        </div>
      </div>`,
  );

  const notice = element.previousElementSibling;
  notice?.querySelector(".btn-uncollapse")?.addEventListener("click", () => notice.classList.remove("collapsed"));
}

function applyBlockBehavior(name: string | null, element: HTMLElement, kind: "post" | "comment", behavior: BlockBehavior) {
  if (!name || !options.blacklist[name]) {
    return;
  }

  if (behavior === "hide" && kind === "comment" && element.parentElement?.classList.contains("reply")) {
    behavior = "collapse";
  }

  if (behavior === "hide") {
    element.style.display = "none";
  } else if (behavior === "collapse" || behavior === "collapse-with-uncollapse") {
    insertBlockedNotice(element, kind, behavior === "collapse-with-uncollapse");
  }
}

function handlePost(post: HTMLElement) {
  const author = getUserNameFromLink(post.querySelector<HTMLAnchorElement>(".body > a[href^='/users/']"));
  applyBlockBehavior(author, post, "post", options.modules.users.blacklist.postBehavior);
}

export default function initBlacklist() {
  const activityFeed = document.querySelector("[data-endless='/feed']") as HTMLElement;
  const comments = Array.from(document.querySelectorAll(".comment")) as HTMLElement[];
  const profiles = Array.from(document.querySelectorAll("[data-endless^='/']")) as HTMLElement[];

  if (activityFeed) {
    activityFeed.querySelectorAll<HTMLElement>(".post:not(.blocked)").forEach(handlePost);

    const activityFeedObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (let node of mutation.addedNodes) {
          if (node instanceof HTMLElement && node.classList.contains("post") && !node.classList.contains("blocked")) {
            handlePost(node);
          }
        }
      }
    });

    activityFeedObserver.observe(activityFeed, { childList: true });
  }

  for (let comment of comments) {
    const author = getUserNameFromLink(comment.querySelector<HTMLAnchorElement>(".avatar[href^='/users/']"));
    applyBlockBehavior(author, comment, "comment", options.modules.users.blacklist.commentBehavior);
  }

  for (let profile of profiles) {
    const profileName = profile.dataset.endless?.match(/\/users\/([\w+]+)$/);
    const profileToolbar = profile.querySelector<HTMLElement>(".profile-toolbar");

    if (!profileName || !profileToolbar) {
      continue;
    }

    mountTracked(BlacklistButton, {
      target: profileToolbar,
      props: {
        name: profileName[1],
      },
    });
  }
}

export function cleanupBlacklist() {
  removeAllNodesIfExist(".bp-blacklist");
}
