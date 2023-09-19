import { GM_getValue, GM_setValue, GM_xmlhttpRequest } from "vite-plugin-monkey/dist/client";

export let linuxData = JSON.parse(GM_getValue("linux-data", "{}") || "{}") as LinuxDataList;
export let linuxLastUpdate = new Date(GM_getValue("linux-last-update", 0));

export function syncLinuxGames() {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://blaeoplus.kubikill.dev/hltb/linux-list",
      nocache: true,
      responseType: "json",
      anonymous: true,
      onload: (response) => {
        if (response.status === 200) {
          linuxData = response.response;
          GM_setValue("linux-data", response.responseText);

          resolve(response.responseText);
        } else {
          reject(`Failed to fetch Linux info from backend. Details: ${response.responseText}`);
        }
      },
      onerror: (error) => {
        reject(error);
      },
    });
  });
}

export async function syncLinux() {
  let linuxGames = syncLinuxGames();

  await linuxGames;

  linuxLastUpdate = new Date();
  GM_setValue("linux-last-update", Date.now());
}
