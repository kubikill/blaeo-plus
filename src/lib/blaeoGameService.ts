import { authenticityToken } from "@/globals";
import { gmRequest } from "./request";

const deleteFailureHints: Record<number, string> = {
  403: 'Most likely game is not considered "missing" by BLAEO.',
  404: "Most likely game is already gone on BLAEO.",
};

export async function deleteGame(game: string) {
  const formData = new URLSearchParams();
  formData.append("_method", "delete");
  formData.append("authenticity_token", authenticityToken);

  try {
    const response = await gmRequest({
      method: "POST",
      url: `https://www.backlog-assassins.net/games/${game}`,
      responseType: "document",
      data: formData,
      headers: {
        "X-CSRF-Token": authenticityToken,
      },
    });

    return response.response;
  } catch (error: any) {
    console.error(`Failed to delete game ${game}. Status: ${error?.statusText}. ${deleteFailureHints[error?.status] ?? ""} Details: ${error?.responseText ?? error}`);
    throw error;
  }
}
