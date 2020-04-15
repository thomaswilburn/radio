import "./feed-item.js";
import ElementBase from "./element-base.js";
import app from "./app.js";

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
    this.elements.refreshButton.addEventListener("click", this.onClickRefresh);
    this.elements.searchButton.addEventListener("click", this.onClickSearch);
    this.elements.markReadButton.addEventListener("click", this.updatePlayed);
    this.addEventListener("play-item", this.updatePlayed);
    app.on("refresh-all", this.onClickRefresh);
  }
  
  static get boundMethods() {
    return [
      "onClickExpand", 
      "onClickUnsubscribe", 
      "onClickMore", 
      "onClickRefresh", 
      "onClickSearch",
      "updatePlayed"
    ];
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

  clearItems() {
    this.cursor = 0;
    this.elements.episodeContainer.querySelectorAll("feed-item").forEach(item => item.parentElement.removeChild(item)); 
  }
  
  async update(url) {
    if (this.updating) return;
    this.elements.container.classList.add("updating");
    this.clearItems();
    this.items = [];
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
      var lastPlayed = new Date((await app.read("played-" + url)));
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
        if (date <= lastPlayed) {
          value.seen = true;
        } else {
          unseen++;
        }
        return value;
      }).filter(d => d);
      this.addItems(10);
      this.lastPlayed = lastPlayed;
      this.elements.count.innerHTML = `${items.length} (${unseen})`;
      await app.write("requested-" + url, (new Date()).valueOf());
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
    episode.setAttribute("feed-title", this.feedTitle);
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
    var expanded = this.elements.expandButton.getAttribute("aria-pressed") == "true";
    this.elements.expandButton.setAttribute("aria-pressed", !expanded);
    this.elements.container.classList.toggle("expanded");
  }

  onClickMore() {
    this.addItems(10);
  }

  onClickRefresh() {
    var url = this.getAttribute("src");
    this.update(url);
  }

  onClickSearch() {
    if (!this.items) return;
    var search = prompt("Query?");
    if (!search) {
      this.elements.container.classList.remove("searching");
      this.elements.searchButton.innerHTML = "search";
      this.clearItems();
      this.addItems(10);
      return;
    }
    this.elements.container.classList.add("searching");
    this.elements.searchButton.innerHTML = "search: " + search;
    var re = new RegExp(search, "gi");
    var results = this.items.filter(item => item.title.match(re) || item.description.match(re));
    this.clearItems();
    results.forEach(item => this.addItem(item));
  }

  updatePlayed(e) {
    e.stopPropagation();
    this.elements.count.innerHTML = `${this.items.length} (0)`;
    app.write(`played-${this.getAttribute("src")}`, (new Date()).valueOf());
    // add feed title and forward this up to the audio player
    if (e.detail && e.detail.url) {
      var { url, title } = e.detail;
      app.fire("play-feed", {
        url, title, feed: this.feedTitle
      });
    }
  }
  
}

FeedListing.define("feed-listing", "feed-listing.html");
