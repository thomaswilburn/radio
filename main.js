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