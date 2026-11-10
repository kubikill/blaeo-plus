import { removeNodeIfExists } from "@/lib/utilities";
import { gmRequest } from "@/lib/request";
import { authenticityToken } from "@/globals";

const previewButtonHtml = `
  <button class="bp-comment-preview-button btn btn-default" type="button" disabled>
    Preview
  </button>
`;

export function addCommentPreview() {
  const newCommentForm = document.getElementById("new-comment");

  if (!newCommentForm) {
    return;
  }

  const textarea = document.getElementById("comment_text") as HTMLTextAreaElement;
  const buttonGroup = newCommentForm.querySelector(".form-group:last-child");

  if (buttonGroup) {
    buttonGroup.insertAdjacentHTML("afterbegin", previewButtonHtml);
  }

  newCommentForm.insertAdjacentHTML("beforeend", '<div class="bp-comment-preview" style="display: none">Preview:<div class="bp-comment-preview-content"></div></div>');

  const previewButton = newCommentForm.querySelector(".bp-comment-preview-button") as HTMLButtonElement;
  const previewContainer = newCommentForm.querySelector(".bp-comment-preview") as HTMLElement;
  const preview = newCommentForm.querySelector(".bp-comment-preview-content") as HTMLElement;

  textarea.addEventListener(
    "focus",
    async () => {
      previewButton.disabled = false;

      previewButton.addEventListener("click", () => {
        let formData = new URLSearchParams({
          utf8: "✓",
          authenticity_token: authenticityToken,
          "post[category]": "private",
          "post[text]": textarea.value,
        });

        gmRequest({
          method: "POST",
          url: "https://www.backlog-assassins.net/posts/preview",
          responseType: "text",
          data: formData,
        })
          .then((response) => {
            preview.innerHTML = response.response;
            previewContainer.style.display = "";
          })
          .catch((error) => console.error(`Failed preview: ${error?.responseText ?? error}`));
      });
    },
    { once: true },
  );
}

export function cleanupCommentPreview() {
  removeNodeIfExists("#main .bp-comment-preview-button");
  removeNodeIfExists("#main .bp-comment-preview");
}
