export class Root extends HTMLElement {
  static selector = "ui-root";
  private rendered = false;

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.rendered) {
      this.render();
      this.rendered = true;
    }
  }

  private render(): void {
    this.innerHTML = `
      <div>
        <splash-screen></splash-screen>
      </div>
    `;
  }
}
