import getPageUidByPageTitle from "roamjs-components/queries/getPageUidByPageTitle";

export const generateId = () => {
  return window.roamAlphaAPI.util.generateUID();
};

export const createOrGetPageByName = async (title: string): Promise<string> => {
  await window.roamAlphaAPI.createPage({ page: { title: title } });
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
  const result = await window.roamAlphaAPI.q(`
 [
  :find ?title:name ?title:uid ?time:date
  :where 
  [?page :node/title ?title:name]
  [?page :block/uid ?title:uid]
  [?page :edit/time ?time:date]
  [(clojure.string/starts-with? ?title:name "${str}")]] 
  `);
  return result as [string, string][];
};

export const getCurrentPageUid = async () => {
  const blockOrPageUid =
    await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
  let pageUid = (await window.roamAlphaAPI.q(
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
  )?.[0]) as unknown as string;

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
  await window.roamAlphaAPI.createPage({
    page: {
      title: title,
    },
  });
  window.roamAlphaAPI.ui.mainWindow.openPage({
    page: { title: title },
  });
}

export const getBlockTextByUid = (uid: string) => {
  const [result] = window.roamAlphaAPI.q(
    `[:find [?e] :where [?b :block/uid "${uid}"] [?b :block/string ?e]]`
  );
  return (result as any as string) || "";
};
