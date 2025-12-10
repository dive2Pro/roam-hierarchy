import { renderApp } from "./hierarchy";
import { RoamExtensionAPI } from "roam-types";

let API: RoamExtensionAPI;
export const initPanel = (api: RoamExtensionAPI) => {
  API = api;
  api.settings.panel.create({
    tabTitle: "Roam Hierarchy",
    settings: [
      {
        id: "brackets",
        name: "Toggle brackets",
        description: "",
        action: {
          type: "switch",
          onChange: (e: any) => {
            const el = document.querySelector(
              ".rm-reference-main"
            ) as HTMLElement;
            !e.target.checked
              ? el.classList.add("no-brackets")
              : el.classList.remove("no-brackets");
          },
        },
      },
      {
        id: "collapsed",
        name: "Collapsed by default",
        description: "",
        action: {
          type: "switch",
        },
      },
      {
        id: "homonyms",
        name: "Toggle Homonyms",
        description: "",
        action: {
          type: "switch",
          onChange: (e: any) => {
            setTimeout(renderApp);
          },
        },
      },
    ],
  });
  const v = api.settings.get("brackets");
  api.settings.set("brackets", v ?? true);
  const v1 = api.settings.get("brackets");
  api.settings.set("homonyms", v1 ?? true);
};


export function isCollapsedByDefault() {
  return !API.settings.get("collapsed");
}