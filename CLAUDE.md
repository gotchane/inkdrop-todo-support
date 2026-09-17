# CLAUDE.md

An Inkdrop plugin that toggles the checkbox on the current line: `- [ ]` ⇄ `- [x]`.

## Constraints

**Inkdrop v6 / CodeMirror 6 only.** Never reintroduce CodeMirror 5 APIs — `cm.doc.*`,
`Pos`, `import ... from "codemirror"`, or the `.CodeMirror` selector. In v6
`inkdrop.getActiveEditor()` returns a CodeMirror 6 `EditorView` directly; there is no
`.cm` wrapper, and positions are plain numeric offsets.

**Keymap/command contract — change both sides or neither.** `keymaps/todo-support.json`
binds `.cm-editor .cm-scroller`; `lib/editor.js` registers on `view.dom` (`.cm-editor`),
an ancestor, so the command event bubbles up to it.

**`lib/toggle-todo.js` must stay import-free.** It holds the pure logic *and* the
`EditorView` adapter. Keeping it free of imports is what lets the tests run with no
`inkdrop` global, no DOM, and no mocking — there is no prior art anywhere in the Inkdrop
ecosystem for mocking `inkdrop`, so the design avoids needing it. `event-kit` and
anything else belongs in `lib/editor.js`.

**`@codemirror/*` is devDependencies only** (tests build a real `EditorState`). Shipping
it as a runtime dependency would load a second CodeMirror instance and break the editor.
Runtime dependencies stay at zero.

**Toggle the mark character only.** Dispatch a change covering exactly one character.
That is what preserves the bullet, the whitespace and the cursor position, and it is
asserted directly in `test/toggle-todo-at-cursor.test.js`.

**Do not reintroduce a multi-rule replace loop.** The v5 code looped two regex rules with
`return` inside a `forEach` — which never breaks — so both rules always ran, and it only
worked because the line text was never reassigned. A single regex replaces it, and the
round-trip tests fail if anyone "tidies" it back.

## Build and test

`"use babel"` at the top of every `lib/` file is required: Inkdrop transpiles those files
at load time with sucrase (`transforms: ["jsx", "imports"]`). Verified present in
Inkdrop 6.1.4's `app.asar`. **There is no build step** — do not add one.

```
npm test        # vitest
```

Tests cover the pure logic and the adapter. The editor wiring (`view.dom`, keymap
selector, `onEditorLoad` timing) can only be verified by running the plugin in Inkdrop.

## Release

```
npm install -g @inkdropapp/ipm-cli   # once
ipm configure                        # once; paste the access key Inkdrop shows

npm test
npm version <major|minor|patch>      # bumps package.json, commits, tags
ipm publish --dry-run                # check the file list
ipm publish
git push --follow-tags
```

`ipm publish` does **not** bump the version or create the tag — `npm version` does, and it
needs a clean working tree. `ipm publish` fetches the README through the GitHub API, so
`repository` in package.json must point at the real public repo.

Bumping `engines.inkdrop` does not strand old users: the registry serves each client the
newest version whose `engines` range matches their Inkdrop major, so v5 users keep getting
0.2.1 as long as it is not unpublished.

## Related

Inkdrop's built-in `core:toggle-task-list` is a *formatting* command (turns lines into or
out of task-list syntax). This plugin flips the checked state of an existing task. They
are complementary, not duplicates.
