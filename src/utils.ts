import getPageUidByPageTitle from "roamjs-components/queries/getPageUidByPageTitle";

export const generateId = () => {
  return window.roamAlphaAPI.util.generateUID();
};

const createPageByTitle = async (title: string) => {
  try {
    await window.roamAlphaAPI.createPage({ page: { title: title } });
  } catch (e) {}
};

export const createOrGetPageByName = async (title: string): Promise<string> => {
  await createPageByTitle(title);
  return getPageUidByPageTitle(title);
};

export const onRouteChange = (cb: () => void) => {
  const onhashchange = window.onhashchange?.bind(window);

  window.onhashchange = (evt) => {
    onhashchange?.call(window, evt);
    setTimeout(() => {
      cb();
    }, 200);
  };
  return () => {
    window.onhashchange = onhashchange;
  };
};

export const getPagesBaseonString = async (str: string) => {
  const result = await window.roamAlphaAPI.data.async.q(`
 [
  :find ?title:name ?title:uid ?time:date
  :in $ ?search:title
  :where 
  [?page :node/title ?title:name]
  [?page :block/uid ?title:uid]
  [?page :edit/time ?time:date]
  [(clojure.string/starts-with? ?title:name ?search:title)]] 
  `, str) as [string, string, number][];
  return result;
};

export const getPagesContainsString = async (str: string) => {
  const result = await window.roamAlphaAPI.data.async.q(`
 [
  :find ?title:name ?title:uid
  :in $ ?search:title 
  :where 
  [?page :node/title ?title:name]
  [?page :block/uid ?title:uid]
  [(clojure.string/includes? ?title:name ?search:title)]]   
  `, str) as [string, string, number][];
  return result;
};

export const getCurrentPageUid = async () => {
  const blockOrPageUid =
    await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
  const res = await window.roamAlphaAPI.data.async.q(
    `[
      :find [?e]
      :in $ ?id
      :where
        [?b :block/uid ?id]
        [?b :block/page ?p]
        [?p :block/uid ?e]
      ]
      `,
    blockOrPageUid
  );
  const pageUid = (res as unknown as string[])?.[0];

  return pageUid || blockOrPageUid;
};
export async function openPageByTitleOnSideBar(title: string) {
  const uid = await createOrGetPageByName(title);
  window.roamAlphaAPI.ui.rightSidebar.addWindow({
    window: {
      "block-uid": uid,
      type: "outline",
    },
  });
}

export async function openPageByTitle(title: string) {
  await createPageByTitle(title);
  window.roamAlphaAPI.ui.mainWindow.openPage({
    page: { title: title },
  });
}

