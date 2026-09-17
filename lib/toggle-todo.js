"use babel";

const DONE = "x";
const EMPTY = " ";

// Indentation + bullet + "[", the mark character, then "]" and the rest.
// Kept as a single regex on purpose: the v5 implementation looped over two
// rules with `return` inside a `forEach`, which never breaks, so both rules
// always ran and it only worked because the line text was never reassigned.
const TODO_LINE = /^(\s*[*+-]\s+\[)([ xX])(\].*)$/;

/**
 * Locate the checkbox mark on a line and give back the character it toggles to.
 * Returns null when the line is not a todo item.
 *
 * @param {string} lineText
 * @returns {{ index: number, mark: string } | null}
 */
export function toggleTodoMark(lineText) {
  const matched = TODO_LINE.exec(lineText);
  if (matched === null) return null;

  const [, head, mark] = matched;
  return {
    index: head.length,
    mark: mark === EMPTY ? DONE : EMPTY,
  };
}

/**
 * Toggle the todo mark on the line under the cursor.
 *
 * The dispatched change covers the single mark character only, so the bullet,
 * the surrounding whitespace and the cursor all survive untouched -- CodeMirror
 * maps the selection across a change this small on its own.
 *
 * @param {import('@codemirror/view').EditorView} view
 * @returns {boolean} false when the cursor is not on a todo line.
 */
export function toggleTodoAtCursor(view) {
  const { state } = view;
  const line = state.doc.lineAt(state.selection.main.head);
  const toggled = toggleTodoMark(line.text);
  if (toggled === null) return false;

  const from = line.from + toggled.index;
  view.dispatch({ changes: { from, to: from + 1, insert: toggled.mark } });
  return true;
}
