import "./feed-collection.js";
import "./audio-player.js";

var player = document.querySelector("audio-player");
var current = null;

document.body.addEventListener("play-item", function(e) {
  if (current) {
    current.removeAttribute("playing");
  }
  current = e.detail.target;
  current.setAttribute("playing", "");
  player.src = e.detail.url;
  player.play();
});

document.querySelector("button.refresh-all").addEventListener("click", function() {
  var collections = document.querySelectorAll("feed-collection");
  collections.forEach(c => c.refresh());
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").then(registration => console.log(registration));
}