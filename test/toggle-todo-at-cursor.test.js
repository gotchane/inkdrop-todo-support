import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { toggleTodoAtCursor } from "../lib/toggle-todo";

/**
 * A stand-in for EditorView built on a real EditorState, so document and
 * selection behaviour is the genuine CodeMirror implementation rather than a
 * hand-rolled fake. Only `dispatch` is ours; nothing here needs a DOM.
 */
function fakeView(doc, cursor) {
  const state = EditorState.create({ doc, selection: { anchor: cursor } });
  const dispatched = [];

  return {
    state,
    dispatched,
    dispatch(spec) {
      dispatched.push(spec);
    },
    /** Apply what was dispatched and report the resulting doc and cursor. */
    result() {
      const next = state.update(...dispatched).state;
      return { doc: next.doc.toString(), cursor: next.selection.main.head };
    },
  };
}

describe("toggleTodoAtCursor", () => {
  it("toggles the line the cursor is on, leaving the other lines alone", () => {
    const doc = "- [ ] first\n- [ ] second\n- [ ] third";
    const view = fakeView(doc, doc.indexOf("second"));

    expect(toggleTodoAtCursor(view)).toBe(true);
    expect(view.result().doc).toBe("- [ ] first\n- [x] second\n- [ ] third");
  });

  // The design contract: we replace the single mark character and nothing else.
  // That is what keeps the bullet, the whitespace and the cursor intact, so it
  // is asserted directly rather than only through its consequences.
  it("dispatches a change covering exactly one character", () => {
    const view = fakeView("- [ ] a", 0);
    toggleTodoAtCursor(view);

    expect(view.dispatched).toHaveLength(1);
    const { changes } = view.dispatched[0];
    expect(changes.to - changes.from).toBe(1);
    expect(changes.insert).toBe("x");
    expect(view.dispatched[0].selection).toBeUndefined();
  });

  it.each([
    ["cursor at end of line", "- [ ] hello", 11],
    ["cursor in the middle of the text", "- [ ] hello", 8],
    ["cursor before the mark", "- [ ] hello", 1],
  ])("preserves the cursor position (%s)", (_name, doc, cursor) => {
    const view = fakeView(doc, cursor);
    toggleTodoAtCursor(view);

    expect(view.result().cursor).toBe(cursor);
  });

  it("preserves bullet and whitespace on a line the old version would rewrite", () => {
    const doc = "*   [ ]   spaced out";
    const view = fakeView(doc, doc.length);

    expect(toggleTodoAtCursor(view)).toBe(true);
    expect(view.result()).toEqual({
      doc: "*   [x]   spaced out",
      cursor: doc.length,
    });
  });

  it("does nothing on a line that is not a todo item", () => {
    const view = fakeView("just some prose", 4);

    expect(toggleTodoAtCursor(view)).toBe(false);
    expect(view.dispatched).toHaveLength(0);
  });

  it("toggles a done item back to empty", () => {
    const view = fakeView("  + [X] done", 0);

    expect(toggleTodoAtCursor(view)).toBe(true);
    expect(view.result().doc).toBe("  + [ ] done");
  });
});
