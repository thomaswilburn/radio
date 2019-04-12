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
    this.elements.unsubscribeButton.addEventListener("click", this.onClickUnsubscribe);
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
    this.elements.container.classList.add("updating");
    this.updating = true;
    var spins = 0;
    var tick = () => {
      spins++;
      var dots = [0, 0, 0].map((_, i) => spins % 3 == i ? "&#9679;" : "&bull;");
      this.elements.title.innerHTML = dots.join("");
    };
    tick();
    var spinner = window.setInterval(tick, 200);
    try {
      var response = await getXML(url);
      // await wait(1000);
      window.clearInterval(spinner);
      this.elements.container.classList.remove("updating");
      this.elements.title.innerHTML = response.querySelector("channel title").textContent;
      var items = Array.from(response.querySelectorAll("item")).slice(0, 100);
      this.elements.count.innerHTML = items.length;
      this.elements.episodeContainer.innerHTML = "";
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
    } catch (err) {
      window.clearInterval(spinner);
      console.log(err);
      this.updating = false;
      this.elements.title.innerHTML = "Unable to pull feed";
      this.elements.container.classList.remove("updating");
    }
  }
  
  onClickUnsubscribe() {
    var url = this.getAttribute("src");
    var e = new CustomEvent("feed-removed", {
      bubbles: true,
      composed: true,
      detail: { url, element: this }
    });
    this.dispatchEvent(e);
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
  background: #333;
  color: white;
}

.metadata button {
  color: inherit;
}

.metadata .title {
 flex: 1;
 padding: 0 8px;
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
  transition: transform .2s ease;
}

.expanded .expander {
  transform: rotate(180deg);
}

.expanded .episodes {
  display: block;
}

.unsubscribe {
  cursor: pointer;
  text-decoration: underline;
  border: none;
  background: transparent;
  text-align: right;
}

.updating .unsubscribe,
.updating .expander {
  display: none;
}

.episodes {
  padding: 0;
  margin: 0;
  display: none;
  border-left: 4px solid #333;
  border-right: 4px solid #333;
}
</style>
<div as="container">
  <div class="metadata">
    <div class="title">
      <span as="title"></span>    
      <button class="unsubscribe" as="unsubscribeButton">(unsubscribe?)</button>
    </div>
    <div class="count" as="count"></div>
    <button class="expander" as="expandButton">⛛</button>
  </div>
  <ul class="episodes" as="episodeContainer"></ul>
</div>
`
  }
  
}

window.customElements.define("feed-listing", FeedListing);