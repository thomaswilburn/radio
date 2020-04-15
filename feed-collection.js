import { FeedListing } from "./feed-listing.js";
import ElementBase from "./element-base.js";
import storage from "./storage.js";
import app from "./app.js";

class FeedCollection extends ElementBase {
  constructor() {
    super();
    
    this.populate();
    
    this.elements.addButton.addEventListener("click", this.onClickAdd);
    this.addEventListener("feed-removed", this.onRemovedFeed);
  }
  
  async populate() {
    this.feeds = (await app.read("feeds")) || [
      "https://www.npr.org/rss/podcast.php?id=510312",
      "https://rss.acast.com/vicegamingsnewpodcast",
      "https://rss.simplecast.com/podcasts/2269/rss"
    ];
    await window.customElements.whenDefined("feed-listing");
    this.feeds.forEach(url => {
      var listing = document.createElement("feed-listing");
      listing.src = url;
      this.elements.feedContainer.appendChild(listing);
    });
  }
  
  async save() {
    this.feeds = this.feeds.filter(f => f);
    return app.write("feeds", this.feeds);
  }
  
  onRemovedFeed(e) {
    this.elements.feedContainer.removeChild(e.detail.element);
    this.feeds = this.feeds.filter(f => f != e.detail.url);
    this.save();
  }
  
  onClickAdd() {
    var url = prompt("Feed URL?");
    if (!url) return;
    this.feeds.push(url);
    this.save();
    var listing = document.createElement("feed-listing");
    listing.setAttribute("src", url);
    this.elements.feedContainer.appendChild(listing);
  }
  
  static get boundMethods() {
    return ["onClickAdd", "onRemovedFeed"]
  }
}

FeedCollection.define("feed-collection", "feed-collection.html");