import "./feed-item.js";
import ElementBase from "./element-base.js";
import Storage from "./storage.js";

var wait = function(delay) {
  return new Promise(ok => setTimeout(ok, delay));
}

var getXML = function(url) {
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", window.location.search == "?noproxy" ? url : "/proxy?" + url);
    xhr.responseType = "document";
    xhr.send();
    xhr.onload = () => ok(xhr.response);
    xhr.onerror = fail;
  });
};

var removeCDATA = str => str.replace(/^<!\[CDATA\[|<[^>]+>|\]\]>$/g, "").trim();

export class FeedListing extends ElementBase {

  constructor() {
    super();
    this.updating = false;
    this.items = [];
    this.cursor = 0;
    this.elements.title.addEventListener("click", this.onClickExpand);
    this.elements.expandButton.addEventListener("click", this.onClickExpand);
    this.elements.unsubscribeButton.addEventListener("click", this.onClickUnsubscribe);
    this.elements.loadMore.addEventListener("click", this.onClickMore);
  }
  
  static get boundMethods() {
    return ["onClickExpand", "onClickUnsubscribe", "onClickMore"];
  }
  
  static get observedAttributes() {
    return ["src"];
  }
  
  attributeChangedCallback(attr, old, value) {
    switch (attr) {
      case "src":
        this.update(value);
        break;
    }
  }
  
  static get mirroredProps() {
    return ["src"];
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
      var response = this.feed = await getXML(url);
      this.elements.container.classList.remove("updating");
      this.feedTitle = response.querySelector("channel title").textContent;
      this.elements.title.innerHTML = this.feedTitle;
      var unseen = 0;
      var lastRequested = new Date((await Storage.get("requested-" + url)));
      // parse item elements
      var items = this.items = Array.from(response.querySelectorAll("item")).map(item => {
        var text = {
          pubDate: null,
          title: null,
          description: null,
          link: null
        };
        for (var k in text) {
          var element = item.querySelector(k);
          if (element) text[k] = removeCDATA(element.textContent);
        }
        var enclosure = item.querySelector("enclosure");
        if (!enclosure) return null;
        enclosure = enclosure.getAttribute("url");
        var date = new Date(text.pubDate ? Date.parse(text.pubDate) : 0);
        var value = { date, enclosure, ...text };
        if (date <= lastRequested) {
          value.seen = true;
        } else {
          unseen++;
        }
        return value;
      }).filter(d => d);
      this.addItems(10);
      this.lastRequested = lastRequested;
      this.elements.count.innerHTML = `${items.length} (${unseen})`;
      await Storage.set("requested-" + url, (new Date()).valueOf());
    } catch (err) {
      console.log(err);
      this.elements.title.innerHTML = "Unable to pull feed";
      this.elements.container.classList.remove("updating");
    }
    window.clearInterval(spinner);
    this.updating = false;
  }

  addItem(item) {
    var episode = document.createElement("feed-item");
    episode.setAttribute("title", item.title || "Untitled");
    episode.innerHTML = item.description;
    episode.setAttribute("url", item.enclosure);
    if (item.link) episode.setAttribute("page", item.link);
    this.elements.episodeContainer.insertBefore(episode, this.elements.loadMore);
  }

  addItems(count) {
    var toAdd = this.items.slice(this.cursor, this.cursor + count);
    toAdd.forEach(item => this.addItem(item));
    this.cursor += count;
    if (this.cursor >= this.items.length) this.elements.loadMore.style.display = "none";
  }
  
  onClickUnsubscribe() {
    var confirm = window.confirm(`Unsubscribe from ${this.feedTitle}?`);
    if (!confirm) return;
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

  onClickMore() {
    this.addItems(10);
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
  font-family: var(--ui-font);
}

.metadata button {
  color: inherit;
}

.metadata .title {
 flex: 1;
 flex-basis: 100%;
 padding: 0 8px;
 white-space: nowrap;
 overflow: hidden;
 min-width: 0;
 text-overflow: ellipsis;
}

.metadata .spacer {
  flex: 1;
  flex-basis: 0%;
}

.metadata .count {
  margin: 0 4px;
  white-space: nowrap;
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
  opacity: 0;
  pointer-events: none;
}

.episodes {
  padding: 0 0 0 4px;
  margin: 0 0 0 4px;
  display: none;
  border-left: 4px dotted #333;
}

.load-more {
  width: 100%;
  display: block;
  text-transform: uppercase;
  padding: 24px 0;
  text-align: center;
  background: white;
  cursor: pointer;
  font-size: 18px;
  border: none;
  text-style: italic;
  font-family: var(--ui-font);
}
</style>
<div as="container">
  <div class="metadata">
    <div class="title" as="title"></div>
    <button class="unsubscribe" as="unsubscribeButton">remove</button>
    <div class="spacer"></div>
    <div class="count" as="count"></div>
    <button class="expander" as="expandButton">&#9661;</button>
  </div>
  <ul class="episodes" as="episodeContainer">
    <button class="load-more" as="loadMore">Load more</button>
  </ul>
</div>
`
  }
  
}

window.customElements.define("feed-listing", FeedListing);
