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
}
</style>
<div class="container" role="list-item">
  <button class="play" as="playButton">play</button>
  <div class="title" as="title"></div>
  <div class="description" as="description"></div>
</div>
    `;
  }
}

window.customElements.define("feed-item", FeedItem);