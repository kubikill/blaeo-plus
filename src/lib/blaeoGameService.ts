import { authenticityToken } from "@/globals";
import { GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

export function deleteGame(game: string) {
  let formData = new URLSearchParams();
  formData.append("_method", "delete");
  formData.append("authenticity_token", authenticityToken);

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url: `https://www.backlog-assassins.net/games/${game}`,
      nocache: true,
      responseType: "document",
      data: formData,
      headers: {
        "X-CSRF-Token": authenticityToken,
      },
      onload: (response) => {
        switch (response.status) {
          case 200:
            resolve(response.response);
            break;
          case 403:
            console.error(`Failed to delete game ${game}. Status: ${response.statusText}. Most likely game is not considered "missing" by BLAEO. Details: ${response.responseText}`);
            reject(response);
            break;
          case 404:
            console.error(`Failed to delete game ${game}. Status: ${response.statusText}. Most likely game is already gone on BLAEO. Details: ${response.responseText}`);
            reject(response);
            break;
          default:
            console.error(`Failed (probably) to delete game ${game}. Status: ${response.statusText}. Details: ${response.responseText}`);
            reject(response);
            break;
        }
      },
      onerror: (error) => {
        console.error(`Failed to delete game ${game}. Status: ${error.statusText}. Response: ${error.responseText}`);
        reject(error);
      },
    });
  });
}
