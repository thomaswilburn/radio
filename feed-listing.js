import "./feed-item.js";
import ElementBase from "./element-base.js";

var wait = function(delay) {
  return new Promise(ok => setTimeout(ok, delay));
}

var getXML = function(url) {
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    xhr.onload = () => ok(xhr.response);
    xhr.onerror = fail;
  });
};

var removeCDATA = str => str.replace(/^<!\[CDATA\[|\]\]>$/g, "");

export class FeedListing extends ElementBase {

  constructor() {
    super();
    this.updating = false;
  }
  
  static get observedAttributes() {
    return ["src"]
  }
  
  attributeChangedCallback(attr, old, value) {
    switch (attr) {
      case "src":
        this.update(value);
        break;
    }
  }
  
  async update(url) {
    console.log(url);
    if (this.updating) return;
    this.classList.add("updating");
    this.updating = true;
    var spins = 0;
    var interval = window.setInterval(() => {
      spins++;
      var dots = [0, 0, 0].map((_, i) => spins % 3 == i ? "&#9679;" : "&bull;");
      this.elements.title.innerHTML = dots.join("");
    }, 300);
    var response = await getXML(url);
    window.clearInterval(interval);
    this.elements.title.innerHTML = response.querySelector("channel title").innerHTML;
    var items = response.querySelectorAll("item");
    this.elements.episodeContainer.innerHTML = "";
    items.forEach(item => {
      var title = item.querySelector("title");
      var description = item.querySelector("description");
      var enclosure = item.querySelector("enclosure");
      if (!enclosure) return;
      var episode = document.createElement("feed-item");
      episode.setAttribute("title", title ? title.innerHTML : "Untitled");
      episode.setAttribute("description", description ? removeCDATA(description.innerHTML) : "");
      episode.setAttribute("url", enclosure.getAttribute("url"));
      this.elements.episodeContainer.appendChild(episode);
    });
  }
  
  onClickUnsubscribe() {
    
  }
  
  onClickExpand() {
    this.classList.toggle("expanded");
  }
  
  static get template() {
    return `
<style>
:host {
  display: block;
}

.metadata {
  display: flex;
}
</style>
<div class="metadata">
  <div class="title" as="title"></div>
  <div class="count" as="count"></div>
  <button class="expander" as="expandButton">+</button>
</div>
<button class="unsubscribe" as="unsubscribeButton">unsubscribe?</button>
<ul class="episodes" as="episodeContainer"></ul>
`
  }
  
}

window.customElements.define("feed-listing", FeedListing);