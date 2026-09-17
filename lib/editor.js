"use babel";

import { Disposable, CompositeDisposable } from "event-kit";
import { toggleTodoAtCursor } from "./toggle-todo";

const NAMESPACE = "todo-support";

export class Editor extends Disposable {
  constructor(view, env) {
    super(() => this.destroy());
    this.view = view;
    this.env = env;
    this.subscriptions = new CompositeDisposable();
    this.registerCommand("mark", () => toggleTodoAtCursor(this.view));
  }

  registerCommand(command, callback) {
    // `view.dom` is the `.cm-editor` root, the CodeMirror 6 counterpart of
    // v5's `cm.display.wrapper`. The keymap binds `.cm-editor .cm-scroller`,
    // a descendant, so the command event bubbles up to this listener.
    this.subscriptions.add(
      this.env.commands.add(this.view.dom, {
        [`${NAMESPACE}:${command}`]: (event) => {
          // Hand the keystroke back to the keymap when there is nothing to
          // toggle, so we don't swallow ctrl-enter for anything else bound to it.
          if (!callback()) event.abortKeyBinding();
        },
      })
    );
  }

  destroy() {
    this.subscriptions.dispose();
  }
}
