import ElementBase from "./element-base.js";

export class FeedItem extends ElementBase {
  constructor() {
    super();
    this.elements.playButton.addEventListener("click", this.onClickPlay);
    this.elements.expandButton.addEventListener("click", this.onClickExpand);
  }
  
  static get observedAttributes() {
    return ["title", "url", "description", "page"];
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
  
  static get boundMethods() {
    return ["onClickPlay", "onClickExpand"];
  }
  
  static get template() {
    return `
<style>
:host {
  display: block;
  border-bottom: 1px solid #888;
  padding: 10px;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  flex: 1;
  color: #333;
  text-decoration: none;
  font-family: var(--title-font);
}

.title[href] {
  text-decoration: underline;
}

.play {
  border: 1px solid #808;
  border-radius: 8px;
  margin: 0 16px 0 0;
  background: transparent;
  padding: 16px 8px;
  color: #808;
  cursor: pointer;
  font-family: var(--ui-font);
}

:host([seen]) .play {
  border: 1px solid black;
  color: black;
}

:host([playing]) .play {
  background: #808;
  color: white;
}

.description {
  padding: 20px;
  font-size: 14px;
  display: none;
  font-family: var(--content-font);
}

.description.expanded {
  display: block;
}

.expand {
  background: transparent;
  color: lightgray;
  border: none;
  font-weight: bold;
  font-size: 24px;
  padding: 20px;
  cursor: pointer;
}

.expand[aria-pressed="true"] {
  font-weight: bold;
  color: black;
}
</style>
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