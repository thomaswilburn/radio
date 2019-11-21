import ElementBase from "./element-base.js";

class AudioPlayer extends ElementBase {
  
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
      this.elements.playButton.setAttribute("state", "seeking");
    } else {
      this.setEnabledState(true);
      this.elements.playButton.setAttribute("state", a.paused ? "paused" : "playing")
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

  static get stylesheet() {
    return "audio-player.css";
  }
  
  static get template() {
    return `
<div class="timecodes">
  <div class="time" as="timeDisplay"></div>
  <div class="time" as="totalDisplay"></div>
</div>
<div class="scrubber disabled" as="scrubber">
  <div class="track"></div>
  <div class="progress" as="progressBar"></div>
</div>
<button disabled as="playButton" class="play button" state="paused">
  <svg class="play-icon" width=16 height=16 viewBox="0 0 16 16" preserveAspectRatio="none">
    <path d="M0,0 L16,8 0,16 Z" />
  </svg>
  <svg class="pause-icon" width=16 height=16 viewBox="0 0 16 16" preserveAspectRatio="none">
    <line x1=4 y1=0 x2=4 y2=16 />
    <line x1=12 y1=0 x2=12 y2=16 />
  </svg>
  <svg class="seek-icon" width=16 height=16 viewBox="0 0 16 16" preserveAspectRatio="none">
    <circle cx=2 cy=8 r=2 />
    <circle cx=8 cy=8 r=2 />
    <circle cx=14 cy=8 r=2 />
  </svg>
</button>
<button disabled as="rewind">-A</button>
<button disabled as="ffwd">+A</button>
`
  }
}

window.customElements.define("audio-player", AudioPlayer);