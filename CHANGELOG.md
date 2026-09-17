## 0.3.0
* **Requires Inkdrop v6.0.0 or later.** Migrated from CodeMirror 5 to CodeMirror 6,
  which Inkdrop v6 rebuilt its editor on. Inkdrop v5 users stay on 0.2.1.
* The keybinding selector changed from `.CodeMirror textarea` to `.cm-editor .cm-scroller`.
  Custom keymaps overriding this binding need updating.
* **Behaviour change:** toggling now preserves the original bullet character and
  spacing. `* [ ] foo` becomes `* [x] foo` (previously `- [x] foo`), and
  `-   [ ]   foo` becomes `-   [x]   foo` (previously `- [x] foo`).
* Fixed a crash on deactivation when no editor had ever been loaded.
* Added tests.
## 0.2.1
* Update detail description
## 0.1.0 - First Release
* Every feature added
* Every bug fixed
