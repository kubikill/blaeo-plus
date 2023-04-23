import { removeNodeIfExists } from "@/lib/utilities";
import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

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

  buttonGroup.insertAdjacentHTML("afterbegin", previewButtonHtml);
  newCommentForm.insertAdjacentHTML(
    "beforeend",
    '<div class="bp-comment-preview" style="display: none">Preview:<div class="bp-comment-preview-content"></div></div>'
  );

  const previewButton = newCommentForm.querySelector(".bp-comment-preview-button") as HTMLButtonElement;
  const previewContainer = newCommentForm.querySelector(".bp-comment-preview") as HTMLElement;
  const preview = newCommentForm.querySelector(".bp-comment-preview-content") as HTMLElement;

  textarea.addEventListener(
    "focus",
    async () => {
      const authenticityToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]').content;

      previewButton.disabled = false;

      previewButton.addEventListener("click", () => {
        let formData = new URLSearchParams({
          utf8: "✓",
          authenticity_token: authenticityToken,
          "post[category]": "private",
          "post[text]": textarea.value,
        });

        GM_xmlhttpRequest({
          method: "POST",
          url: "https://www.backlog-assassins.net/posts/preview",
          nocache: true,
          responseType: "text",
          data: formData,
          onload: (response) => {
            if (response.status === 200) {
              preview.innerHTML = response.response;
              previewContainer.style.display = "";
            } else {
              console.error(`Failed preview: ${response.responseText}`);
            }
          },
          onerror: (error) => {},
        });
      });
    },
    { once: true }
  );
}

export function cleanupCommentPreview() {
  removeNodeIfExists("#main .bp-comment-preview-button");
  removeNodeIfExists("#main .bp-comment-preview");
}
