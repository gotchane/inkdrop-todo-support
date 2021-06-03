"use babel";

import { Disposable, CompositeDisposable } from "event-kit";
import { Pos } from "codemirror";

const NAMESPACE = "todo-support";
const DONE = "x";
const BULLET = "-";
export class CodeMirrorEditor extends Disposable {
  constructor(cm) {
    super(() => this.destroy());
    this.subscriptions = new CompositeDisposable();
    this.cm = cm;
    this.registerCommand("mark", () => this.markDone());
  }

  markDone() {
    const currentCursor = this.cm.doc.getCursor();
    const lineNumber = currentCursor.line;
    const lineText = this.cm.doc.getLine(lineNumber);

    // refs: https://github.com/fabiospampinato/vscode-markdown-todo/blob/d35849cbc4248f4186493c59c2550b5b1f283d5c/src/consts.ts#L19-L23
    const todoRegexes = {
      todoEmpty: /^(\s*)([*+-]\s+\[ \]\s*)(.*)$/,
      todoDone: /^(\s*)([*+-]\s+\[[xX]\]\s*)(.*)$/,
    };

    // refs: https://github.com/fabiospampinato/vscode-markdown-todo/blob/d35849cbc4248f4186493c59c2550b5b1f283d5c/src/commands.ts#L66-L70
    const replaceRules = [
      [todoRegexes.todoEmpty, `$1${BULLET} [${DONE}] $3`],
      [todoRegexes.todoDone, `$1${BULLET} [ ] $3`],
    ];

    replaceRules.forEach(([regex, replacement]) => {
      if (!regex.test(lineText)) return false;

      const replacedLineText = lineText.replace(regex, replacement);
      this.cm.doc.replaceRange(
        replacedLineText,
        new Pos(currentCursor.line, 0),
        new Pos(currentCursor.line, lineText.length)
      );
      this.cm.doc.setCursor(currentCursor);
      return true;
    });
  }

  registerCommand(command, callback) {
    const targetElement = this.cm.display.wrapper;
    this.subscriptions.add(
      inkdrop.commands.add(targetElement, {
        [`${NAMESPACE}:${command}`]: () => {
          callback();
        },
      })
    );
  }

  destroy() {
    this.subscriptions.dispose();
  }
}
