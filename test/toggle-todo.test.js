import { describe, expect, it } from "vitest";

import { toggleTodoMark } from "../lib/toggle-todo";

/**
 * Apply the result of toggleTodoMark to a line so the expectations below can be
 * written as whole lines, which is how they read in the editor.
 */
function apply(lineText) {
  const toggled = toggleTodoMark(lineText);
  if (toggled === null) return null;

  const { index, mark } = toggled;
  return lineText.slice(0, index) + mark + lineText.slice(index + 1);
}

describe("toggleTodoMark", () => {
  it.each([
    ["- [ ] a", "- [x] a"],
    ["- [x] a", "- [ ] a"],
    ["- [X] a", "- [ ] a"],
  ])("toggles %o to %o", (input, expected) => {
    expect(apply(input)).toBe(expected);
  });

  it.each([
    ["* [ ] a", "* [x] a"],
    ["* [x] a", "* [ ] a"],
    ["+ [ ] a", "+ [x] a"],
    ["+ [x] a", "+ [ ] a"],
  ])("keeps the original bullet: %o -> %o", (input, expected) => {
    expect(apply(input)).toBe(expected);
  });

  it.each([
    ["  - [ ] a", "  - [x] a"],
    ["\t- [ ] a", "\t- [x] a"],
    ["-   [ ]   a", "-   [x]   a"],
    ["    * [x] nested", "    * [ ] nested"],
  ])("keeps the original whitespace: %o -> %o", (input, expected) => {
    expect(apply(input)).toBe(expected);
  });

  it("toggles a todo item with no text after it", () => {
    expect(apply("- [ ]")).toBe("- [x]");
    expect(apply("- [x]")).toBe("- [ ]");
  });

  it.each([
    ["- a"],
    ["plain text"],
    [""],
    ["   "],
    ["# [ ] heading"],
    ["[ ] no bullet"],
    ["-[ ] no space after bullet"],
    ["- [y] unknown mark"],
    ["- [] empty brackets"],
    ["- [  ] two spaces"],
  ])("returns null for a non-todo line: %o", (input) => {
    expect(toggleTodoMark(input)).toBeNull();
  });

  it("reports the index of the mark character, not the whole line", () => {
    expect(toggleTodoMark("- [ ] a")).toEqual({ index: 3, mark: "x" });
    expect(toggleTodoMark("  + [x] a")).toEqual({ index: 5, mark: " " });
  });

  // Guards the bug the v5 implementation had: two replace rules in a `forEach`
  // whose `return` never broke the loop, so both rules ran every time. It only
  // worked because the line text was never reassigned between them. If anyone
  // ever "tidies" this back into a multi-rule loop, this fails.
  it.each(["- [ ] a", "- [x] a", "* [x] keeps bullet", "-   [ ]   spaced"])(
    "round-trips %o back to itself",
    (input) => {
      expect(apply(apply(input))).toBe(input);
    }
  );

  // Toggling off an uppercase [X] writes back a lowercase [x]; the mark
  // character is the one thing this function is meant to normalise.
  it("normalises an uppercase mark to lowercase on the way back", () => {
    expect(apply(apply("* [X] a"))).toBe("* [x] a");
  });
});
