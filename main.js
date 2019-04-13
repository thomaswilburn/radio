import "./feed-collection.js";
import "./audio-player.js";

var player = document.querySelector("audio-player");

document.body.addEventListener("play-item", function(e) {
  player.src = e.detail.url;
  player.play();
});