"use babel";

import { CompositeDisposable } from "event-kit";
import { Editor } from "./editor";

let editor = null;
let subscriptions = null;

module.exports = {
  activate(env) {
    subscriptions = new CompositeDisposable();

    const view = env.getActiveEditor();
    if (view != null) editor = new Editor(view, env);

    // Subscribe even when an editor was already active: onEditorLoad only fires
    // for editors loaded after this point, never retroactively, so there is no
    // double-construction risk. Skipping it would leave `editor` pointing at a
    // disposed instance once an editor unloads and a later one loads.
    subscriptions.add(
      env.onEditorLoad((loadedView) => {
        editor = new Editor(loadedView, env);
      })
    );
    subscriptions.add(
      env.onEditorUnload(() => {
        editor?.dispose();
        editor = null;
      })
    );
  },

  deactivate() {
    subscriptions?.dispose();
    subscriptions = null;
    editor?.dispose();
    editor = null;
  },
};
