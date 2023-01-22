import { hierarchyInit } from "./hierarchy";
import { initAPI } from "./settings";

let initial = (extensionAPI: RoamExtensionAPI) => {
  initAPI(extensionAPI);
  const hierarchyUnload = hierarchyInit();
  return () => {
    hierarchyUnload();
  };
};

let initialed = () => {};

function onload({ extensionAPI }: { extensionAPI: RoamExtensionAPI }) {
  initialed = initial(extensionAPI);
}

function onunload() {
  initialed();
}

export default {
  onload,
  onunload,
};
