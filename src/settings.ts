let extensionAPI: RoamExtensionAPI;

export const initAPI = (api: RoamExtensionAPI) => {
  extensionAPI = api;
  api.settings.panel.create({
    tabTitle: 'Roam Hierarchy',
    settings: [
      {
        id: 'brackets',
        name: "Toggle brackets",
        description: "",
        action: {
          type: "switch",
          onChange: (e: any) => {
            const el = document.querySelector(".rm-reference-main") as HTMLElement
            !e.target.checked ? el.classList.add('no-brackets') : el.classList.remove('no-brackets')
          }
        },
      }
    ]
  });
  const v = api.settings.get("brackets");
  api.settings.set('brackets', v ?? true )
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

