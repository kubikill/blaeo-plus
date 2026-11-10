import { authenticityToken } from "@/globals";
import { gmRequest } from "./request";

export async function getList(listId: string): Promise<BlaeoListJson> {
  try {
    const response = await gmRequest({
      method: "GET",
      url: `https://www.backlog-assassins.net/lists/${listId}.json`,
      responseType: "json",
    });

    return response.response.list;
  } catch (error: any) {
    console.error(`Failed to get games from BLAEO list ${listId}. Details: ${error?.responseText ?? error}`);
    throw error;
  }
}

export async function setList(listId: string, games: string[]) {
  const formData = new URLSearchParams();

  for (let game of games) {
    formData.append("games[]", game);
  }

  try {
    const response = await gmRequest({
      method: "POST",
      url: `https://www.backlog-assassins.net/lists/${listId}/games`,
      responseType: "json",
      data: formData,
      headers: {
        "X-CSRF-Token": authenticityToken,
      },
    });

    return response.response;
  } catch (error: any) {
    console.error(`Failed to set games of BLAEO list ${listId}. Status: ${error?.statusText}. Details: ${error?.responseText ?? error}`);
    throw error;
  }
}
