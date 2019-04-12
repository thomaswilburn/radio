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

var removeCDATA = str => str.replace(/^<!\[CDATA\[|<[^>]+>|\]\]>$/g, "");

export class FeedListing extends ElementBase {

  constructor() {
    super();
    this.updating = false;
    this.elements.expandButton.addEventListener("click", this.onClickExpand);
  }
  
  static get boundMethods() {
    return ["onClickExpand", "onClickUnsubscribe"];
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
    this.elements.title.innerHTML = response.querySelector("channel title").textContent;
    var items = response.querySelectorAll("item");
    this.elements.count.innerHTML = items.length;
    this.elements.episodeContainer.innerHTML = "";
    this.elements.container.classList.add("expanded");
    items.forEach(item => {
      var title = item.querySelector("title");
      var description = item.querySelector("description");
      var enclosure = item.querySelector("enclosure");
      if (!enclosure) return;
      var episode = document.createElement("feed-item");
      episode.setAttribute("title", title ? title.textContent : "Untitled");
      episode.setAttribute("description", description ? removeCDATA(description.textContent) : "");
      episode.setAttribute("url", enclosure.getAttribute("url"));
      this.elements.episodeContainer.appendChild(episode);
    });
  }
  
  onClickUnsubscribe() {
    
  }
  
  onClickExpand() {
    this.elements.container.classList.toggle("expanded");
  }
  
  static get template() {
    return `
<style>
:host {
  display: block;
  border-bottom: 1px solid #CCC;
}

.metadata {
  display: flex;
  align-items: center;
}

.metadata .title {
 flex: 1;
}

.metadata .count {
  margin: 0 4px;
}

.expander {
  border: none;
  padding: 10px;
  font-weight: bold;
  background: transparent;
  cursor: pointer;
}

.episodes, .unsubscribe {
  display: none;
}

.expanded .episodes,
.expanded .unsubscribe {
  display: block;
}

.unsubscribe {
  cursor: pointer;
  text-decoration: underline;
  border: none;
  background: transparent;
  text-align: right;
  float: right;
}

.episodes {
  padding: 0;
  margin: 0;
}
</style>
<div as="container">
  <div class="metadata">
    <div class="title" as="title"></div>
    <div class="count" as="count"></div>
    <button class="expander" as="expandButton">⛛</button>
  </div>
  <button class="unsubscribe" as="unsubscribeButton">unsubscribe?</button>
  <ul class="episodes" as="episodeContainer"></ul>
</div>
`
  }
  
}

window.customElements.define("feed-listing", FeedListing);