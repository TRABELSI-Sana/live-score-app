const BASE_ONLINE = "https://livefoot.online";
const BASE_TN = "https://livefoot.tn";

export function getSiteBase() {
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".tn")) {
    return BASE_TN;
  }
  return BASE_ONLINE;
}

export function getAlternateSiteBase() {
  return getSiteBase() === BASE_TN ? BASE_ONLINE : BASE_TN;
}
