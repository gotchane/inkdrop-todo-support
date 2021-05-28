'use babel';

import { CompositeDisposable } from 'event-kit'
import { CodeMirrorEditor } from './code-mirror-editor'

let editor = null

module.exports = {
  activate() {
    this.subscriptions = new CompositeDisposable()
    const activeEditor = inkdrop.getActiveEditor()

    if (activeEditor !== undefined) {
      editor = new CodeMirrorEditor(activeEditor.cm)
    } else {
      this.subscriptions.add(
        inkdrop.onEditorLoad(e => {
          editor = new CodeMirrorEditor(e.cm)
        })
      )
    }
  },

  deactivate() {
    this.subscriptions.dispose()
    editor.dispose()
  }
};
