export default class ElementBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    var def = new.target;
    if (def.template) this.shadowRoot.innerHTML = def.template;
    this.elements = {};
    this.shadowRoot.querySelectorAll("[as]").forEach(element => {
      var prop = element.getAttribute("as");
      this.elements[prop] = element;
    });
    if (def.boundMethods) {
      def.boundMethods.forEach(f => this[f] = this[f].bind(this));
    }
  }
}