export default class ElementBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    var def = new.target;
    if (def.template) this.shadowRoot.innerHTML = def.template;
    if (def.stylesheet) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = def.stylesheet;
      this.stylesheet = link;
    }
    this.elements = {};
    this.shadowRoot.querySelectorAll("[as]").forEach(element => {
      var prop = element.getAttribute("as");
      this.elements[prop] = element;
    });
    if (def.boundMethods) {
      def.boundMethods.forEach(f => this[f] = this[f].bind(this));
    }
    if (def.mirroredProps) {
      def.mirroredProps.forEach(p => Object.defineProperty(this, p, {
        get() { this.getAttribute(p) },
        set(v) { return this.setAttribute(p, v) }
      }));
    }
  }

  // call with super.connectedCallback()
  connectedCallback() {
    if (this.stylesheet) this.shadowRoot.appendChild(this.stylesheet);
  }

  disconnectedCallback() {

  }

  attributeChangedCallback() {
    
  }
}