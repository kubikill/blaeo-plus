import { gmRequest } from "@/lib/request";
import { getAuthenticityToken } from "@/lib/utilities";
import { mount, unmount, type Component, type MountOptions } from "svelte";

export const BP_VERSION = "1.3.0-beta.3";
export const SUPPORT_URL = "https://steamcommunity.com/groups/attackyourbacklog/discussions/1/7155698768546603592/";

const mountedComponents: Record<string, any>[] = [];

export function mountTracked<Props extends Record<string, any>, Exports extends Record<string, any>>(component: Component<Props, Exports>, options: MountOptions<Props>): Exports {
  const instance = mount(component, options);
  mountedComponents.push(instance);
  return instance;
}

export function unmountAll() {
  for (let instance of mountedComponents.splice(0)) {
    try {
      unmount(instance);
    } catch (error) {
      console.error("BLAEO+: failed to unmount component", error);
    }
  }
}

export const optionsMenuComponent = {
  component: null as { open(): void } | null,
};

export let userData = {
  name: "",
  games: [],
};

export let authenticityToken = getAuthenticityToken();

export function getUserName() {
  const blaeoProfileLink = document.querySelector('#navbar .navbar-right .btn-group a[href^="/users/"]') as HTMLAnchorElement;
  if (blaeoProfileLink) {
    const name = blaeoProfileLink.href.match(/\/users\/([\w+]+)$/);
    if (name) {
      userData.name = name[1];
    }
  }
}

export async function getUserGames(name: string): Promise<BlaeoGamesJson> {
  try {
    const response = await gmRequest({
      method: "GET",
      url: `https://www.backlog-assassins.net/users/${name}/games.json`,
      responseType: "json",
    });

    userData.games = response.response.games;
    return response.response.games;
  } catch (error: any) {
    console.error(`Failed to fetch ${name}'s games from BLAEO. Details: ${error?.responseText ?? error}`);
    throw error;
  }
}
