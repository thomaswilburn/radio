import "./feed-collection.js";
import "./audio-player.js";

var player = document.querySelector("audio-player");

document.body.addEventListener("play-feed", function(e) {
  var { url, feed, title } = e.detail;
  player.src = url;
  player.title = `${feed} - ${title}`
  player.play();
});

document.querySelector("button.refresh-all").addEventListener("click", function() {
  var collections = document.querySelectorAll("feed-collection");
  collections.forEach(c => c.refresh());
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").then(registration => console.log(registration));
}