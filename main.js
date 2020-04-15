import "./tool-bar.js";
import "./feed-collection.js";
import "./audio-player.js";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").then(registration => console.log(registration));
}