import ElementBase from "./element-base.js";

class AudioPlayer extends ElementBase {
  constructor() {
    super();
    this.audio = document.createElement("audio");
    this.audio.addEventListener("timeupdate", this.onAudio);
    this.audio.addEventListener("seeking", this.onAudio);
    this.elements.playButton.addEventListener("click", this.onClickPlay);
    this.elements.ffwd.addEventListener("click", this.onFFwd);
    this.elements.rewind.addEventListener("click", this.onRewind);
    this.elements.scrubber.addEventListener("click", this.onClickScrubber);
    this.elements.scrubber.addEventListener("mousedown", this.onTouchScrubber);
    this.elements.scrubber.addEventListener("touchstart", this.onTouchScrubber);
    this.elements.scrubber.addEventListener("touchmove", this.onDragScrubber);
    this.elements.scrubber.addEventListener("touchend", this.onReleaseScrubber);
    this.onAudio();
    this.setEnabledState(false);
  }
  
  static get boundMethods() {
    return [
      "onClickPlay",
      "onClickScrubber",
      "onAudio",
      "onTouchScrubber",
      "onDragScrubber",
      "onReleaseScrubber",
      "onFFwd",
      "onRewind"
    ];
  }
  
  static get observedAttributes() {
    return ["src"]
  }
  
  attributeChangedCallback(attr, old, value) {
    switch (attr) {
      case "src":
        this.src = value;
        break;
    }
  }
  
  get src() {
    return this.audio.src;
  }
  
  set src(value) {
    this.setEnabledState(!!value);
    this.audio.src = value;
  }
  
  disconnectedCallback() {
    this.audio.pause();
  }

  onFFwd() {
    this.audio.currentTime += 10;
  }

  onRewind() {
    this.audio.currentTime -= 10;
  }
  
  onClickPlay() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  setEnabledState(enabled) {
    var buttons = ["playButton", "rewind", "ffwd"].map(b => this.elements[b]);
    if (enabled) {
      buttons.forEach(b => b.removeAttribute("disabled"));
      this.elements.scrubber.classList.remove("disabled");
    } else {
      buttons.forEach(b => b.setAttribute("disabled", ""));
    }
  }

  updateAudioPosition(x) {
    var sBounds = this.elements.scrubber.getBoundingClientRect();
    var position = x - sBounds.left;
    var ratio = position / sBounds.width;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    var dest = this.audio.duration * ratio | 0;
    this.audio.currentTime = dest;
  }
  
  onClickScrubber(e) {
    if (!this.audio.src) return;
    this.updateAudioPosition(e.clientX);
  }

  onReleaseScrubber(e) {
    var touches = e.changedTouches || e.touches;
    var touch = touches[0];
    this.updateAudioPosition(touch.clientX);
  }

  onTouchScrubber(e) {
    // do nothing, we handle it by drag
  }

  onDragScrubber(e) {
    var touches = e.changedTouches || e.touches;
    var touch = touches[0];
    this.updateAudioPosition(touch.clientX);
  }
  
  formatTime(time) {
    var hours = (time / (60 * 60)) | 0;
    var minutes = (time - (hours * 60 * 60)) / 60 | 0;
    minutes = minutes.toString().padStart(2, "0");
    var seconds = time % 60 | 0;
    seconds = seconds.toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
  
  onAudio(e) {
    var a = this.audio;
    if (e && e.type == "seeking") {
      this.setEnabledState(false);
      this.elements.playButton.innerHTML = "...";
    } else {
      this.setEnabledState(true);
      this.elements.playButton.innerHTML = !a.paused ? "||" : ">";
    }
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
  padding: 8px;
}

button {
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
  font-weight: bold;
  line-height: 1;
  margin-right: 10px;
}

button[disabled] {
  border-color: #CCC;
  color: #CCC;
}

.scrubber {
  flex: 1;
  position: relative;
  align-items: center;
  display: flex;
  align-self: stretch;
  margin: 0 10px;
  cursor: pointer;
}

.scrubber .track {
  flex: 1;
  height: 10px;
  background: #CCC;
  pointer-events: none;
}

.progress {
  position: absolute;
  top: 50%;
  height: 16px;
  transform: translateY(-50%);
  bottom: 0;
  left: 0;
  width: 0%;
  background: #C8C;
  pointer-events: none;
}

.scrubber.disabled {
  cursor: default;
}

.scrubber.disabled .progress {
  opacity: .1;
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

@media (min-width: 500px) {
  .timecodes div { display: inline }
  .timecodes .time[as="totalDisplay"]::before { content: "/ " }
}

</style>
<button disabled as="playButton"></button>
<button disabled as="rewind">-A</button>
<button disabled as="ffwd">+A</button>
<div class="scrubber disabled" as="scrubber">
  <div class="track"></div>
  <div class="progress" as="progressBar"></div>
</div>
<div class="timecodes">
  <div class="time" as="timeDisplay"></div>
  <div class="time" as="totalDisplay"></div>
</div>
`
  }
}

window.customElements.define("audio-player", AudioPlayer);