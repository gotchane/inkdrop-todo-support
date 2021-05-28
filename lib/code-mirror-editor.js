'use babel'

import { Disposable } from 'event-kit'

export class CodeMirrorEditor extends Disposable {
  constructor(cm) {
    super()
    this.cm = cm
  }
}