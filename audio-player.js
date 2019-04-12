import ElementBase from "./element-base.js";

var bound = [
  "onClickPlay",
  "onClickScrubber",
  "onAudio"
];

class AudioPlayer extends ElementBase {
  constructor() {
    super();
    this.audio = document.createElement("audio");
    this.elements.playButton.addEventListener("click", this.onClickPlay);
    this.elements.scrubber.addEventListener("click", this.onClickScrubber);
    this.audio.addEventListener("timeupdate", this.onAudio);
    this.onAudio();
  }
  
  static get boundMethods() {
    return ["onClickPlay", "onClickScrubber", "onAudio"]
  }
  
  static get observedAttributes() {
    return ["src"]
  }
  
  attributeChangedCallback(attr, old, value) {
    switch (attr) {
      case "src":
        this.audio.src = value;
        break;
    }
  }
  
  disconnectedCallback() {
    this.audio.pause();
  }
  
  onClickPlay() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }
  
  onClickScrubber(e) {
    var sBounds = this.elements.scrubber.getBoundingClientRect();
    var position = e.clientX - sBounds.left;
    var ratio = position / sBounds.width;
    var dest = this.audio.duration * ratio | 0;
    this.audio.currentTime = dest;
  }
  
  formatTime(time) {
    var hours = (time / (60 * 60)) | 0;
    var minutes = (time - (hours * 60 * 60)) / 60 | 0;
    minutes = minutes.toString().padStart(2, "0");
    var seconds = time % 60 | 0;
    seconds = seconds.toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
  
  onAudio() {
    var a = this.audio;
    this.elements.playButton.innerHTML = a.paused ? "||" : ">";
    this.elements.timeDisplay.innerHTML = this.formatTime(a.currentTime);
    this.elements.totalDisplay.innerHTML = this.formatTime(a.duration);
    
    var ratio = a.currentTime / a.duration * 100;
    this.elements.progressBar.style.width = `${ratio | 0}%`;
  }
  
  play() {
    return this.audio.play();
  }
  
  pause() {
    return this.audio.pause();
  }
  
  static get template() {
    return `
<style>
:host {
  display: flex;
  align-items: center;
  font-family: monospace;
}

.play {
  width: 40px;
  height: 40px;
  border-radius: 100%;
  border: 3px solid #808;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  background: white;
  color: #808;
}

.scrubber {
  flex: 1;
  height: 10px;
  background: #CCC;
  position: relative;
  margin: 0 10px;
}

.progress {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 0%;
  background: #C8C;
}

.progress::after {
  position: absolute;
  top: -2px;
  right: -5px;
  width: 10px;
  height: calc(100% + 4px);
  display: block;
  content: "";
  background: #808;
}

</style>
<button class="play" as="playButton"></button>
<div class="scrubber" as="scrubber">
  <div class="progress" as="progressBar"></div>
</div>
<div class="time" as="timeDisplay"></div> / 
<div class="time" as="totalDisplay"></div>
`
  }
}

window.customElements.define("audio-player", AudioPlayer);