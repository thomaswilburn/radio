import ElementBase from "./element-base.js";
import app from "./app.js";

export class FeedItem extends ElementBase {
  constructor() {
    super();

    app.on("playing", e => {
      var matched = e.url == this.getAttribute("url");
      if (matched) {
        this.setAttribute("playing", "");
      } else {
        this.removeAttribute("playing");
      }
    });
  }

  connectedCallback() {
    this.elements.playButton.addEventListener("click", this.onClickPlay);
    this.elements.expandButton.addEventListener("click", this.onClickExpand);
  }

  disconnectedCallback() {
    this.elements.playButton.removeEventListener("click", this.onClickPlay);
    this.elements.expandButton.removeEventListener("click", this.onClickExpand);
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
    // notify the collection that playback has started
    this.dispatch("play-item", {
      title: this.getAttribute("title"),
      url: this.getAttribute("url")
    });
  }

  onClickExpand() {
    var expanded = this.elements.description.classList.toggle("expanded");
    this.elements.expandButton.setAttribute("aria-pressed", expanded);
  }
  
  static get boundMethods() {
    return ["onClickPlay", "onClickExpand"];
  }
}

FeedItem.define("feed-item", "feed-item.html");