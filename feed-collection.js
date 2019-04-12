import { FeedListing } from "./feed-listing.js";
import ElementBase from "./element-base.js";
import storage from "./storage.js";

class FeedCollection extends ElementBase {
  constructor() {
    super();
    
    this.populate();
    
    this.elements.addButton.addEventListener("click", this.onClickAdd);
    this.addEventListener("feed-removed", this.onRemovedFeed);
  }
  
  async populate() {
    this.feeds = (await storage.get("feeds")) || [
      "https://rss.acast.com/begoodandrewatchit",
      "https://rss.acast.com/vicegamingsnewpodcast",
      "https://rss.simplecast.com/podcasts/2269/rss"
    ];
    this.feeds.forEach(url => {
      var listing = document.createElement("feed-listing");
      listing.setAttribute("src", url);
      this.elements.feedContainer.appendChild(listing);
    });
  }
  
  async save() {
    return storage.set("feeds", this.feeds);
  }
  
  onRemovedFeed(e) {
    this.elements.feedContainer.removeChild(e.detail.element);
    this.feeds = this.feeds.filter(f => f != e.detail.url);
    this.save();
  }
  
  onClickAdd() {
    var url = prompt("Feed URL?");
    this.feeds.push(url);
    this.save();
    var listing = document.createElement("feed-listing");
    listing.setAttribute("src", url);
    this.elements.feedContainer.appendChild(listing);
  }
  
  static get boundMethods() {
    return ["onClickAdd", "onRemovedFeed"]
  }
  
  static get template() {
    return `
<style>
.add-feed {
  border: none;
  background: transparent;
  display: block;
  text-align: center;
  padding: 8px 20px;
  font-size: 20px;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  margin: auto;
}
</style>
<div class="feeds" as="feedContainer"></div>
<button class="add-feed" as="addButton">add feed</button>
`
  }
}

window.customElements.define("feed-collection", FeedCollection);