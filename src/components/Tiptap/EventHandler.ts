import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { EditorView } from "prosemirror-view";

export const EventHandler = Extension.create({
  name: "eventHandler",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("eventHandler"),
        props: {
          handleKeyDown(view: EditorView, event: KeyboardEvent) {
            if (event.key === "Backspace") {
              console.log("hello from underworld", view);
              console.log("lastSelectedViewDesc", view.state);
              const selection = document.getSelection();
              const range = selection?.getRangeAt(0);
              console.log("range", range?.cloneContents().childNodes);
              if (range?.cloneContents().childNodes.length !== 0) {
                console.log("yoooo");
                event.preventDefault();
                throw new ErrorEvent("not allowed");
              }
            }
          },
          // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        },
      }),
    ];
  },
});
