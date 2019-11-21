import ElementBase from "./element-base.js";

export class FeedItem extends ElementBase {

  static get boundMethods() {
    return ["onClickPlay", "onClickExpand"];
  }
  
  static get observedAttributes() {
    return ["title", "url", "description", "page"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.elements.playButton.addEventListener("click", this.onClickPlay);
    this.elements.expandButton.addEventListener("click", this.onClickExpand);
  }

  disconnectedCallback() {
    this.elements.playButton.removeEventListener("click", this.onClickPlay);
    this.elements.expandButton.removeEventListener("click", this.onClickExpand);
  }
  
  attributeChangedCallback(attr, old, value) {
    switch (attr) {
      case "title":
        this.elements[attr].innerHTML = value;
      break;

      case "description":
        this.elements.expandButton.style.display = value ? "block" : "none";
      break;

      case "page":
        this.elements.title.href = value == "null" ? "" : value;
      break;
    }
  }
  
  onClickPlay() {
    // send a play event up with the URL
    var e = new CustomEvent("play-item", {
      bubbles: true,
      composed: true,
      detail: {
        target: this,
        url: this.getAttribute("url")
      }
    });
    this.dispatchEvent(e);
  }

  onClickExpand() {
    var expanded = this.elements.description.classList.toggle("expanded");
    this.elements.expandButton.setAttribute("aria-pressed", expanded);
  }

  static get stylesheet() {
    return "feed-item.css";
  }
  
  static get template() {
    return `
<div class="container" role="list-item">
  <div class="row">
    <button class="play" as="playButton">play</button>
    <a class="title" as="title" target="_blank"></a>
    <button class="expand" as="expandButton" aria-label="Show description">&vellip;</button>
  </div>
  <div class="description" as="description">
    <slot></slot>
  </div>
</div>
    `;
  }
}

window.customElements.define("feed-item", FeedItem);