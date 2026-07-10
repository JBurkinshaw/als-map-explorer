// A CodeMirror 6 editor that shows a full snippet but only lets the learner edit
// a marked region in the middle. The surrounding scaffold (prefix + suffix) is
// locked via a `changeFilter` that protects those character ranges, so learners
// see real, in-context code but can only change the highlighted part (the "hybrid"
// model from the clarification session).

import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

export interface CodeSnippet {
  /** Locked text shown before the editable region. */
  prefix: string;
  /** The initial editable text. */
  editable: string;
  /** Locked text shown after the editable region. */
  suffix: string;
}

export class LockedEditor {
  private readonly view: EditorView;
  private readonly prefixLen: number;
  private readonly suffixLen: number;
  private readonly originalEditable: string;

  constructor(container: HTMLElement, snippet: CodeSnippet) {
    this.prefixLen = snippet.prefix.length;
    this.suffixLen = snippet.suffix.length;
    this.originalEditable = snippet.editable;

    const doc = snippet.prefix + snippet.editable + snippet.suffix;

    // Protect the prefix [0, prefixLen] and suffix [editableEnd, docLen] ranges,
    // allowing edits only in the middle. editableEnd is recomputed per change so
    // the region tracks correctly as the learner grows/shrinks it.
    const lockScaffold = EditorState.changeFilter.of((tr) => {
      const docLen = tr.startState.doc.length;
      const editableEnd = docLen - this.suffixLen;
      return [0, this.prefixLen, editableEnd, docLen];
    });

    this.view = new EditorView({
      parent: container,
      state: EditorState.create({
        doc,
        extensions: [basicSetup, javascript({ typescript: true }), lockScaffold, EditorView.lineWrapping],
      }),
    });
  }

  /** The current text of the editable region only. */
  getEditableText(): string {
    const docLen = this.view.state.doc.length;
    return this.view.state.doc.sliceString(this.prefixLen, docLen - this.suffixLen);
  }

  /**
   * The full snippet (locked prefix + editable region + locked suffix). This is
   * what gets run: the prefix/suffix carry the actual `helper(...)` call, so the
   * editable region alone would not invoke anything (and an object literal in it
   * would parse as a block statement). Run the whole thing instead.
   */
  getFullText(): string {
    return this.view.state.doc.toString();
  }

  /** Replace the editable region (used to keep code in sync with HTML inputs). */
  setEditableText(text: string): void {
    const docLen = this.view.state.doc.length;
    const to = docLen - this.suffixLen;
    if (this.view.state.doc.sliceString(this.prefixLen, to) === text) return;
    this.view.dispatch({ changes: { from: this.prefixLen, to, insert: text } });
  }

  /** Restore the editable region to its original snippet (FR-011). */
  reset(): void {
    this.setEditableText(this.originalEditable);
  }

  destroy(): void {
    this.view.destroy();
  }
}
