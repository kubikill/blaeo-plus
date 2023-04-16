import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

const previewButtonHtml = `
  <button class="bp-comment-preview-button btn btn-default" type="button" disabled>
    Preview
  </button>
`;

function getAuthenticityToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://www.backlog-assassins.net/posts/new",
      responseType: "document",
      onload: (response) => {
        if (response.status === 200) {
          const authenticityTokenField = document.querySelector('input[name="authenticity_token"]') as HTMLInputElement;

          if (authenticityTokenField) {
            resolve(authenticityTokenField.value);
          } else {
            reject("Failed to find authenticity token field");
          }
        } else {
          reject(`Failed preview: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

export default function addCommentPreview() {
  const newCommentForm = document.getElementById("new-comment");

  if (!newCommentForm) {
    return;
  }

  const textarea = document.getElementById("comment_text") as HTMLTextAreaElement;
  const buttonGroup = newCommentForm.querySelector(".form-group:last-child");

  buttonGroup.insertAdjacentHTML("afterbegin", previewButtonHtml);
  buttonGroup.insertAdjacentHTML(
    "afterend",
    '<div class="bp-comment-preview" style="display: none">Preview:<div class="bp-comment-preview-content"></div></div>'
  );

  const previewButton = newCommentForm.querySelector(".bp-comment-preview-button") as HTMLButtonElement;
  const previewContainer = newCommentForm.querySelector(".bp-comment-preview") as HTMLElement;
  const preview = newCommentForm.querySelector(".bp-comment-preview-content") as HTMLElement;

  textarea.addEventListener("focus", async () => {
    const authenticityToken = await getAuthenticityToken();

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
  });
}
