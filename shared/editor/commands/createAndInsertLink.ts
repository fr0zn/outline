import { Node } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { ToastType } from "../types";

function findPlaceholderLink(doc: Node, href: string) {
  let result: { pos: number; node: Node } | undefined;

  function findLinks(node: Node, pos = 0) {
    // get text nodes
    if (node.type.name === "text") {
      // get marks for text nodes
      node.marks.forEach((mark) => {
        // any of the marks links?
        if (mark.type.name === "link") {
          // any of the links to other docs?
          if (mark.attrs.href === href) {
            result = { node, pos };
          }
        }
      });
    }

    if (!node.content.size) {
      return;
    }

    node.descendants(findLinks);
  }

  findLinks(doc);
  return result;
}

const createAndInsertLink = async function (
  view: EditorView,
  title: string,
  href: string,
  options: {
    dictionary: any;
    onCreateLink: (title: string) => Promise<string>;
    onShowToast: (message: string, code: string) => void;
  }
) {
  const { dispatch, state } = view;
  const { onCreateLink, onShowToast } = options;

  try {
    const url = await onCreateLink(title);
    const result = findPlaceholderLink(view.state.doc, href);

    if (!result) {
      return;
    }

    dispatch(
      view.state.tr
        .removeMark(
          result.pos,
          result.pos + result.node.nodeSize,
          state.schema.marks.link
        )
        .addMark(
          result.pos,
          result.pos + result.node.nodeSize,
          state.schema.marks.link.create({ href: url })
        )
    );
  } catch (err) {
    const result = findPlaceholderLink(view.state.doc, href);
    if (!result) {
      return;
    }

    dispatch(
      view.state.tr.removeMark(
        result.pos,
        result.pos + result.node.nodeSize,
        state.schema.marks.link
      )
    );

    // let the user know
    if (onShowToast) {
      onShowToast(options.dictionary.createLinkError, ToastType.Error);
    }
  }
};

export default createAndInsertLink;
