import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  getCurrentPageUid,
  getPagesBaseonString,
  onRouteChange,
  openPageByTitle,
  openPageByTitleOnSideBar,
} from "./utils";
import ReactDOM from "react-dom";
import getPageTitleByPageUid from "roamjs-components/queries/getPageTitleByPageUid";
import getBlockUidsReferencingPage from "roamjs-components/queries/getBlockUidsReferencingPage";
import getPageTitleByBlockUid from "roamjs-components/queries/getPageTitleByBlockUid";
import { Button, Icon, Collapse } from "@blueprintjs/core";

function Hierarchy() {
  const [pages, setPages] = useState<{ title: string; uid: string }[]>([]);
  let titleRef = useRef("");
  async function getHierarchy() {
    const uid = await getCurrentPageUid();
    const title = getPageTitleByPageUid(uid);
    let fulFillTile = title;
    if (title.includes("/")) {
    } else {
      fulFillTile = `${title}/`;
    }
    const pages = await getPagesBaseonString(fulFillTile);
    const lastIndex = title.lastIndexOf("/");

    if (lastIndex > -1) titleRef.current = title.substring(0, lastIndex);
    setPages(
      pages
        .filter((info) => info[0] !== title)
        .map((info) => ({
          title: info[0],
          uid: info[1],
        }))
    );
  }
  const caretTitleVm = useCaretTitle("Hierarchy");
  useEffect(() => {
    if (caretTitleVm.open) {
      getHierarchy();
    }
  }, [caretTitleVm.open]);

  const content = pages.length ? (
    pages.map((info) => {
      return <HierarchyLink info={info} />;
    })
  ) : titleRef.current ? (
    <NoChildLink>
      <SpansLink spans={titleRef.current.split("/")} />
    </NoChildLink>
  ) : null;
  if (!content) {
    return null;
  }
  return (
    <div className="rm-hierarchy">
      <div style={{ marginBottom: 5 }}>{caretTitleVm.Comp}</div>
      {!caretTitleVm.open ? null : (
        <div className="rm-mentions refs-by-page-view">{content}</div>
      )}
    </div>
  );
}

const useCaretTitle = (children?: any, initOpen = true) => {
  const [open, setOpen] = useState(initOpen);

  return {
    open,
    Comp: (
      <CaretTitle open={open} onChange={setOpen}>
        {children}
      </CaretTitle>
    ),
  };
};

function CaretTitle(props: {
  open: boolean;
  onChange: (v: boolean) => void;
  children: any;
}) {
  return (
    <div className="caret-title" onClick={() => props.onChange(!props.open)}>
      <Icon
        icon={props.open ? "caret-down" : "caret-right"}
        style={{ cursor: "pointer", marginRight: 2 }}
        className="bp3-icon-standard rm-caret dont-focus-block"
      />
      <strong
        style={{
          color: "rgb(206, 217, 224)",
        }}
      >
        {props.children}
      </strong>
    </div>
  );
}

function PageLink(props: { title: string; name: string; className?: string }) {
  return (
    <>
      <a
        onClick={(e) => {
          if (e.shiftKey) {
            openPageByTitleOnSideBar(props.title);
            return;
          }
          return openPageByTitle(props.title);
        }}
        className={props.className}
        style={{ cursor: "pointer" }}
      >
        <span className="rm-page-ref__brackets">[[</span>
        <span className="rm-page-ref--link">{props.name}</span>
        <span className="rm-page-ref__brackets">]]</span>
      </a>
    </>
  );
}

function SpansLink(props: { spans: string[] }) {
  return (
    <>
      {props.spans.map((s, index) => {
        const pageTitle = props.spans.slice(0, index + 1).join("/");
        return (
          <>
            <PageLink title={pageTitle} name={s} />
            {index < props.spans.length - 1 ? <span> / </span> : null}
          </>
        );
      })}
    </>
  );
}

const NoChildLink = (props: { children: any }) => {
  return (
    <div
      className="flex-h-box"
      style={{ justifyItems: "center", alignItems: 'center'}}
    >
      <Icon className="icon-caret" style={{ margin: '0 6px 0 6px'}} icon="circle" size={6}></Icon>
      <strong
        style={{
          color: "rgb(206, 217, 224)",
        }}
      >
        {props.children}
      </strong>
    </div>
  );
};

function HierarchyLink(props: { info: { title: string; uid: string } }) {
  const { title } = props.info;
  const spans = title.split("/");
  // 找到所有层级比当前页面层级低的 references
  const caretTitleVm = useCaretTitle(<SpansLink spans={spans} />, false);
  const referencingBlocks = useMemo(
    () => getBlockUidsReferencingPage(title),
    [title]
  );
  return (
    <div>
          {referencingBlocks.length ? caretTitleVm.Comp : <NoChildLink>
            <SpansLink spans={spans} />
          </NoChildLink>}
      {caretTitleVm.open ? (
        <div className="rm-mentions refs-by-page-view">
          <HierarchyMentions blocks={referencingBlocks} />
        </div>
      ) : null}
    </div>
  );
}

function groupBySamePage(uids: string[]) {
  const group: Record<
    string,
    {
      title: string;
      uids: string[];
    }
  > = {};
  uids.forEach((uid) => {
    const pageTitle = getPageTitleByBlockUid(uid);
    if (group[pageTitle]) {
      group[pageTitle].uids.push(uid);
    } else {
      group[pageTitle] = {
        title: pageTitle,
        uids: [uid],
      };
    }
  });
  return Object.values(group);
}

function HierarchyMentions(props: { blocks: string[] }) {
  const [isOpen, setOpen] = useState(true);
  return (
    <>
      {groupBySamePage(props.blocks).map((info) => {
        return (
          <div className="page-group rm-ref-page-view">
            <div className="rm-ref-page-view-title">
              <Icon
                icon={`caret-${isOpen ? "down" : "right"}`}
                className={`icon-caret icon-caret${isOpen ? "-open" : ""}`}
                onClick={() => setOpen(!isOpen)}
              ></Icon>
              <PageLink
                title={info.title}
                name={info.title}
                className="rm-page__title"
              />
            </div>
            {isOpen ? (
              <div className="" style={{ marginLeft: 4 }}>
                {info.uids.map((uid) => {
                  return (
                    <div style={{ marginBottom: 5 }}>
                      <ReferencingBlock uid={uid} key={uid} />
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function ReferencingBlock(props: { uid: string }) {
  const ref = useRef<HTMLDivElement>();
  useEffect(() => {
    window.roamAlphaAPI.ui.components.renderBlock({
      uid: props.uid,
      el: ref.current,
    });
  }, []);
  return (
    <div className="rm-reference-item">
      <div ref={ref} />
    </div>
  );
}

export function hierarchyInit() {
  let unSub = () => {};
  const init = () => {
    console.log("hierarchy initial");
    const el = document.createElement("div");
    const parent = document.querySelector(".rm-reference-main").children[0];
    parent.insertBefore(el, parent.childNodes[0]);
    ReactDOM.render(<Hierarchy />, el);
    unSub = () => {
      parent.removeChild(el);
    };
  };
  onRouteChange(() => {
    unSub();
    init();
  });
  init();
  const removeStyle = addStyle();
  return () => {
    unSub();
    removeStyle();
  };
}

function addStyle() {
  const style = document.createElement("style");
  document.head.appendChild(style);
  style.innerHTML = `
  .rm-hierarchy {
    margin-bottom: 10px;
  }
  .rm-hierarchy .caret-title .rm-caret {
    opacity: 0;
  }

  .rm-hierarchy .page-group .icon-caret {
    opacity: 0;
  }

  .rm-hierarchy:hover .caret-title .rm-caret{
    opacity: 1;
  }
  .rm-hierarchy .page-group .icon-caret-open{
        opacity: 1;
   }
  .rm-hierarchy:hover .page-group .icon-caret,.icon-caret-open{
    opacity: 1;
  }
    `;
  return () => {
    document.head.removeChild(style);
  };
}
