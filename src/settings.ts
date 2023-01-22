import { initPanel } from "./settings-panel";

let extensionAPI: RoamExtensionAPI;

export const initAPI = (api: RoamExtensionAPI) => {
  extensionAPI = api;
  initPanel(api);
};

const CONFIG_PREFIX = "config-";

type Config = {
  sort: number;
  level: number;
};
export const readConfigFromUid = (uid: string) => {
  const key = CONFIG_PREFIX + uid;
  try {
    const jsonStr = extensionAPI.settings.get(key) as string;
    const json = JSON.parse(jsonStr);
    return (json || {
      sort: 0,
      level: 0,
    }) as Config;
  } catch (e) {
    return {
      sort: 0,
      level: 0,
    };
  }
};

export const saveConfigByUid = (uid: string, config: Config) => {
  const key = CONFIG_PREFIX + uid;
  extensionAPI.settings.set(key, JSON.stringify(config));
};

export const isHomonymsEnabled = () => {
  return !!extensionAPI.settings.get("homonyms");
}