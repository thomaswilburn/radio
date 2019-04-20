import ElementBase from "./element-base.js";

export class FeedItem extends ElementBase {
  constructor() {
    super();
    this.elements.playButton.addEventListener("click", this.onClickPlay);
  }
  
  static get observedAttributes() {
    return ["title", "url", "description"];
  }
  
  attributeChangedCallback(attr, old, value) {
    switch (attr) {
      case "title":
      case "description":
        this.elements[attr].innerHTML = value;
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
  
  static get boundMethods() {
    return ["onClickPlay"];
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
}

.play {
  border: 1px solid #808;
  border-radius: 8px;
  margin: 0 8px;
  background: transparent;
  padding: 4px 8px;
  color: #808;
}

:host([playing]) .play {
  background: #808;
  color: white;
}

.description {
  padding: 20px;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  overflow: hidden;
}
</style>
<div class="container" role="list-item">
  <div class="row">
    <button class="play" as="playButton">play</button>
    <div class="title" as="title"></div>
  </div>
  <div class="description" as="description"></div>
</div>
    `;
  }
}

window.customElements.define("feed-item", FeedItem);