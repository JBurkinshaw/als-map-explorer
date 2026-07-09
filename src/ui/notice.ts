// A small, dependency-free banner for surfacing non-fatal errors and info
// messages (bad code edits, failed/empty ALS calls, missing API key). Keeping the
// last working map visible while showing the message satisfies SC-006.

import styles from './notice.module.css';

export type NoticeType = 'error' | 'info';

export class Notice {
  private readonly el: HTMLDivElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = styles.notice;
    this.el.hidden = true;
    this.el.setAttribute('role', 'status');
    container.appendChild(this.el);
  }

  show(message: string, type: NoticeType = 'error'): void {
    this.el.textContent = message;
    this.el.dataset.type = type;
    this.el.hidden = false;
  }

  clear(): void {
    this.el.hidden = true;
    this.el.textContent = '';
  }
}
