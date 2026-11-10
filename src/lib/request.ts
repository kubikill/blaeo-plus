import { GM_xmlhttpRequest, type GmResponseEvent, type GmResponseType, type GmXmlhttpRequestOption } from "vite-plugin-monkey/dist/client";

export const BACKEND_URL = "https://blaeoplus.kubikill.dev/hltb";
export const BACKEND_TIMEOUT_MS = 15000;

type RequestDetails<R extends GmResponseType> = Omit<GmXmlhttpRequestOption<R, undefined>, "onload" | "onerror" | "ontimeout" | "onabort">;

export function gmRequest<R extends GmResponseType = "text">(details: RequestDetails<R>, expectedStatus = 200): Promise<GmResponseEvent<R, undefined>> {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest<R, undefined>({
      nocache: true,
      ...details,
      onload: (response) => (response.status === expectedStatus ? resolve(response) : reject(response)),
      onerror: reject,
      ontimeout: () => reject(new Error("The request timed out")),
      onabort: () => reject(new Error("The request was aborted")),
    });
  });
}

export async function fetchBackendJson<T>(path: string): Promise<T> {
  const response = await gmRequest({
    method: "GET",
    url: `${BACKEND_URL}/${path}`,
    responseType: "json",
    anonymous: true,
    timeout: BACKEND_TIMEOUT_MS,
  });

  return response.response as T;
}
