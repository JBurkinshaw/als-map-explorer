// Thin, typed factories over the Web Awesome form components. Each returns a small
// handle with get/set/onChange so the tabs stay focused on wiring, not DOM plumbing.
// Web Awesome elements are custom elements; we cast to the minimal shape we use.

import '@awesome.me/webawesome/dist/components/select/select.js';
import '@awesome.me/webawesome/dist/components/option/option.js';
import '@awesome.me/webawesome/dist/components/switch/switch.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/slider/slider.js';

type ValueEl = HTMLElement & { value: string };
type CheckedEl = HTMLElement & { checked: boolean };
type NumberEl = HTMLElement & { value: number };

export interface Control<T> {
  el: HTMLElement;
  get(): T;
  set(value: T): void;
  onChange(fn: (value: T) => void): void;
}

export function selectControl(
  label: string,
  options: { value: string; label: string }[],
  initial: string,
): Control<string> {
  const el = document.createElement('wa-select') as ValueEl;
  el.setAttribute('label', label);
  for (const option of options) {
    const opt = document.createElement('wa-option') as ValueEl;
    opt.value = option.value;
    opt.textContent = option.label;
    el.appendChild(opt);
  }
  el.value = initial;
  return {
    el,
    get: () => el.value,
    set: (value) => {
      el.value = value;
    },
    onChange: (fn) => el.addEventListener('change', () => fn(el.value)),
  };
}

export function switchControl(label: string, initial: boolean): Control<boolean> {
  const el = document.createElement('wa-switch') as CheckedEl;
  el.textContent = label;
  el.checked = initial;
  return {
    el,
    get: () => el.checked,
    set: (value) => {
      el.checked = value;
    },
    onChange: (fn) => el.addEventListener('change', () => fn(el.checked)),
  };
}

export function inputControl(label: string, initial: string, type = 'text'): Control<string> {
  const el = document.createElement('wa-input') as ValueEl;
  el.setAttribute('label', label);
  el.setAttribute('type', type);
  el.value = initial;
  return {
    el,
    get: () => el.value,
    set: (value) => {
      el.value = value;
    },
    onChange: (fn) => el.addEventListener('change', () => fn(el.value)),
  };
}

export function sliderControl(
  label: string,
  initial: number,
  min: number,
  max: number,
  step = 1,
): Control<number> {
  const el = document.createElement('wa-slider') as NumberEl;
  el.setAttribute('label', label);
  el.setAttribute('min', String(min));
  el.setAttribute('max', String(max));
  el.setAttribute('step', String(step));
  el.value = initial;
  return {
    el,
    get: () => Number(el.value),
    set: (value) => {
      el.value = value;
    },
    // Sliders emit `input` continuously as the thumb moves.
    onChange: (fn) => el.addEventListener('input', () => fn(Number(el.value))),
  };
}
