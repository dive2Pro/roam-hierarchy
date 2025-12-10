import React, { useEffect, useRef } from "react";

type ReversePullBlock = {
  ":block/uid": string;
  ":block/string": string;
  ":node/title": string;
  ":block/_children": ReversePullBlock[];
};

export function BreadcrumbsBlock(props: { uid: string; showPage?: boolean }) {
  const ref = useRef();
  useEffect(() => {
    window.roamAlphaAPI.ui.components.renderBlock({
      uid: props.uid,
      el: ref.current,
      // @ts-ignore
      "zoom-path?": true,
    });
  }, [props.uid]);

  return <div ref={ref} />;
}
