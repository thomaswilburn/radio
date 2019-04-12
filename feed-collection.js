import { FeedListing } from "./feed-listing.js";
import ElementBase from "./element-base.js";
import storage from "./storage.js";

class FeedCollection extends ElementBase {
  constructor() {
    super();
    
    this.feeds = ["https://rss.acast.com/begoodandrewatchit"];
    this.feeds.forEach(url => {
      var listing = document.createElement("feed-listing");
      listing.setAttribute("src", url);
      this.elements.feedContainer.appendChild(listing);
    });
  }
  
  async populate() {
    
  }
  
  async save() {
    
  }
  
  onClickAdd() {
    
  }
  
  static get boundMethods() {
    return ["onClickAdd"]
  }
  
  static get template() {
    return `
<style>

</style>
<div class="feeds" as="feedContainer"></div>
<button class="add-feed" as="addButton">add feed</button>
`
  }
}

window.customElements.define("feed-collection", FeedCollection);