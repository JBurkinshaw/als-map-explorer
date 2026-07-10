// Shared layout for a capability tab: HTML inputs (controls) on top, the editable
// code region in the middle, Apply/Reset buttons, and a plain-language explanation
// with a reference link at the bottom. Each tab fills `controls` and wires the
// Apply/Reset callbacks; the structure is identical across tabs.

import '@awesome.me/webawesome/dist/components/button/button.js';

import type { Explanation } from '../types';
import styles from './tab.module.css';

export interface TabShell {
  element: HTMLElement;
  controls: HTMLElement;
  editorMount: HTMLElement;
  onApply(fn: () => void): void;
  onReset(fn: () => void): void;
}

export function createTabShell(explanation: Explanation): TabShell {
  const element = document.createElement('div');
  element.className = styles.tab;

  const controls = document.createElement('div');
  controls.className = styles.controls;

  const editorMount = document.createElement('div');
  editorMount.className = styles.editor;

  const buttons = document.createElement('div');
  buttons.className = styles.buttons;

  const applyBtn = document.createElement('wa-button');
  applyBtn.setAttribute('variant', 'brand');
  applyBtn.textContent = 'Apply code';

  const resetBtn = document.createElement('wa-button');
  resetBtn.setAttribute('appearance', 'outlined');
  resetBtn.textContent = 'Reset';

  buttons.append(applyBtn, resetBtn);

  element.append(controls, editorMount, buttons, renderExplanation(explanation));

  return {
    element,
    controls,
    editorMount,
    onApply: (fn) => applyBtn.addEventListener('click', fn),
    onReset: (fn) => resetBtn.addEventListener('click', fn),
  };
}

function renderExplanation(exp: Explanation): HTMLElement {
  const box = document.createElement('div');
  box.className = styles.explanation;

  // Render each paragraph as its own block so multi-paragraph explanations read
  // as distinct steps rather than one run-on line.
  for (const text of exp.paragraphs) {
    const p = document.createElement('p');
    p.textContent = text;
    box.appendChild(p);
  }

  const link = document.createElement('a');
  link.href = exp.referenceUrl;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = `\u{1F4D6} ${exp.referenceLabel}`;

  box.appendChild(link);
  return box;
}
