// The right-hand code panel: a Web Awesome split-panel with the map on the left
// and a tabbed set of capability panels on the right. Stories register their tab
// via registerTab().

import '@awesome.me/webawesome/dist/components/split-panel/split-panel.js';
import '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import '@awesome.me/webawesome/dist/components/tab/tab.js';
import '@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js';

import styles from './codePanel.module.css';

export interface TabRegistration {
  id: string;
  label: string;
  content: HTMLElement;
}

export class CodePanel {
  /** The element the MapLibre map mounts into. */
  readonly mapContainer: HTMLElement;
  private readonly tabGroup: HTMLElement;

  constructor(root: HTMLElement) {
    const split = document.createElement('wa-split-panel');
    split.setAttribute('position', '58');
    split.className = styles.split;

    this.mapContainer = document.createElement('div');
    this.mapContainer.slot = 'start';
    this.mapContainer.className = styles.map;

    const panelWrap = document.createElement('div');
    panelWrap.slot = 'end';
    panelWrap.className = styles.panel;

    this.tabGroup = document.createElement('wa-tab-group');
    panelWrap.appendChild(this.tabGroup);

    split.append(this.mapContainer, panelWrap);
    root.appendChild(split);
  }

  registerTab(reg: TabRegistration): void {
    const tab = document.createElement('wa-tab');
    tab.setAttribute('panel', reg.id);
    tab.textContent = reg.label;

    const panel = document.createElement('wa-tab-panel');
    panel.setAttribute('name', reg.id);
    panel.appendChild(reg.content);

    this.tabGroup.append(tab, panel);
  }
}
