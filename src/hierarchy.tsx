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
import {
  Button,
  Icon,
  Popover,
  MenuItem,
  Menu,
  IconName,
  Tooltip,
  Slider,
  Label,
} from "@blueprintjs/core";
import { BreadcrumbsBlock } from "./breadcrumbs-block";
import { readConfigFromUid, saveConfigByUid } from "./settings";

function Hierarchy() {
  const [pages, setPages] = useState<
    { title: string; uid: string; time: number; level: number }[]
  >([]);
  const [sort, setSort] = useState({
    sorts: [
      {
        icon: "sort",
        text: "Priority",
        sort: () => 0,
      },
      {
        icon: "sort-alphabetical",
        text: "Alphabetical asc",
        sort: (a, b) => {
          return a.title.localeCompare(b.title);
        },
      },
      {
        icon: "sort-alphabetical-desc",
        text: "Alphabetical desc",
        sort: (a, b) => {
          return b.title.localeCompare(a.title);
        },
      },
      {
        icon: "sort-asc",
        text: "Edit time asc",
        sort: (a, b) => {
          return a.time - b.time;
        },
      },
      {
        icon: "sort-desc",
        text: "Edit time desc",
        sort: (a, b) => {
          return b.time - a.time;
        },
      },
    ] as {
      icon: IconName;
      text: string;
      sort: (
        a: { title: string; uid: string; time: number },
        b: { title: string; uid: string; time: number }
      ) => number;
    }[],
    index: 0,
  });
  const [level, setLevel] = useState({
    min: 1,
    max: 1,
    current: 1,
  });
  const uidRef = useRef("");
  let titleRef = useRef("");
  async function getHierarchy() {
    const uid = await getCurrentPageUid();
    uidRef.current = uid;
    const title = getPageTitleByPageUid(uid);
    let fulFillTile = title;
    if (title.includes("/")) {
    } else {
      fulFillTile = `${title}/`;
    }
    const pages = await getPagesBaseonString(fulFillTile);
    const lastIndex = title.lastIndexOf("/");
    if (lastIndex > -1) titleRef.current = title.substring(0, lastIndex);
    const config = readConfigFromUid(uid);
    setSort((prev) => ({ ...prev, index: config.sort }));

    const pageInfos = pages
      .filter((info) => info[0] !== title)
      .map((info) => {
        const t = info[0].substring(fulFillTile.length + 1);

        return {
          title: info[0],
          uid: info[1],
          time: info[2],
          level: t.split("/").length,
        };
      });

    const maxLevel = Math.max(
      ...pageInfos.map((info) => {
        return info.level;
      }),
      1
    );

    setLevel((prev) => ({
      ...prev,
      max: maxLevel,
      current: config.level === 0 ? maxLevel : config.level,
    }));

    setPages(pageInfos);
  }
  const caretTitleVm = useCaretTitle(
    (pages.length ? `${pages.length} ` : "") + "Hierarchy"
  );
  useEffect(() => {
    if (caretTitleVm.open) {
      getHierarchy();
    }
  }, [caretTitleVm.open]);

  const content = pages.length ? (
    pages
      .sort(sort.sorts[sort.index].sort)
      .filter((page) => {
        return page.level <= level.current;
      })
      .map((info) => {
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
      <div style={{ marginBottom: 5, position: "relative" }}>
        {caretTitleVm.Comp}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
          }}
        >
          <Popover
            autoFocus={false}
            enforceFocus={false}
            content={
              <Menu>
                <MenuItem text="sorts">
                  {sort.sorts.map((item, index) => {
                    return (
                      <MenuItem
                        active={index === sort.index}
                        icon={item.icon}
                        text={item.text}
                        onClick={() => {
                          setSort((prev) => {
                            return {
                              ...prev,
                              index,
                            };
                          });

                          saveConfigByUid(uidRef.current, {
                            level: level.current,
                            sort: index,
                          });
                        }}
                      ></MenuItem>
                    );
                  })}
                </MenuItem>
                <MenuItem text="deep level">
                  <Slider
                    stepSize={1}
                    min={1}
                    max={level.max}
                    value={level.current}
                    onChange={(v) =>
                      setLevel((prev) => ({ ...prev, current: v }))
                    }
                    onRelease={(v) => {
                      setLevel((prev) => ({ ...prev, current: v }));
                      saveConfigByUid(uidRef.current, {
                        level: v,
                        sort: sort.index,
                      });
                    }}
                  ></Slider>
                </MenuItem>
              </Menu>
            }
          >
            <Button small minimal icon="cog" />
          </Popover>
        </div>
      </div>
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
          e.preventDefault();
          e.stopPropagation();
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
      style={{ justifyItems: "center", alignItems: "center" }}
    >
      <Icon
        className="icon-caret"
        style={{ margin: "0 6px 0 6px" }}
        icon="circle"
        size={6}
      ></Icon>
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
    <div className="rm-mention">
      {referencingBlocks.length ? (
        caretTitleVm.Comp
      ) : (
        <NoChildLink>
          <SpansLink spans={spans} />
        </NoChildLink>
      )}
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

function Mention({ info }: { info: { title: string; uids: string[] } }) {
  const [isOpen, setOpen] = useState(true);
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
              <div style={{ marginBottom: 5 }} className="rm-reference-item">
                <BreadcrumbsBlock uid={uid} showPage={false} />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
function HierarchyMentions(props: { blocks: string[] }) {
  return (
    <>
      {groupBySamePage(props.blocks).map((info) => (
        <Mention info={info} key={info.title} />
      ))}
    </>
  );
}

export function hierarchyInit() {
  let unSub = () => {};
  const init = () => {
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
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
  }
  .rm-hierarchy .bp3-menu-item {
    outline: none;
  }

  .rm-hierarchy .bp3-menu-item a{
    text-decoration: none;
  }
  .rm-hierarchy .caret-title .rm-caret {
    opacity: 0;
    cursor: pointer;
  }

  .rm-hierarchy .page-group .icon-caret {
    opacity: 0;
  }

  .rm-hierarchy > div:first-child:hover .caret-title:first-child .rm-caret{
    opacity: 1;
  }

  .rm-mention {
    margin-bottom: 5px;
  }
  .rm-hierarchy .page-group .icon-caret-open{
    opacity: 1;
   }

  .rm-mention:hover .caret-title .rm-caret{
    opacity: 1 !important;
   }

  .block-breadcrumbs {
    flex-wrap: wrap;
    display: flex;
    flex-direction: row;
    padding: 5px 5px 5px 8px;
  }

  .block-breadcrumbs span.block-br-item {
    white-space: unset;
    align-items: center;
    display: inline-flex;
    cursor: pointer;
    font-size: 12px;
  }

  .page  .roam-block {
    position: relative;
  }

  .page .rm-block-separator {
    min-width: 0px;
    max-width: 10px;
    flex: 0 0 0px;
  }

  .rm-hierarchy .levels {
    display: flex;
  }
  .rm-hierarchy .levels .bp3-slider {
    width: 100px;
    margin-left: 10px;
  }
    `;
  return () => {
    document.head.removeChild(style);
  };
}
