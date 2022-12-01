import { hierarchyInit } from "./hierarchy";
import { initAPI } from "./settings";

let initial = (extensionAPI: RoamExtensionAPI) => {
  const hierarchyUnload = hierarchyInit();
  initAPI(extensionAPI);
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
