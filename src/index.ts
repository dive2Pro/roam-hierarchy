import { hierarchyInit } from "./hierarchy";

let initial = (extensionAPI: any) => {
  const hierarchyUnload = hierarchyInit();
  return () => {
    hierarchyUnload();
  };
};

let initialed = () => {};

function onload({ extensionAPI }: any) {
  initialed = initial(extensionAPI);
}

function onunload() {
  initialed();
}

if (!process.env.ROAM_DEPOT) {
  hierarchyInit();
}
export default {
  onload,
  onunload,
};
