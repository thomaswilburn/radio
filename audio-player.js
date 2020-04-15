import ElementBase from "./element-base.js";
import app from "./app.js";

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
    app.on("play-feed", this.onPlayItem);
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
      "onRewind",
      "onPlayItem"
    ];
  }
  
  static get observedAttributes() {
    return ["src", "title"]
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

  get title() {
    return this.elements.title.innerHTML;
  }

  set title(value) {
    this.elements.title.innerHTML = value.trim();
  }
  
  disconnectedCallback() {
    this.audio.pause();
  }
  
  onPlayItem(data) {
    console.log(data);
    var { title, url } = data;
    this.title = title;
    this.src = url;
    this.play();
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
      this.elements.playButton.setAttribute("aria-pressed", !a.paused);
      this.elements.playButton.setAttribute("state", a.paused ? "paused" : "playing")
    }
    this.elements.timeDisplay.innerHTML = this.formatTime(a.currentTime);
    this.elements.totalDisplay.innerHTML = this.formatTime(a.duration);

    app.fire("playing", { url: this.src });
    
    var ratio = a.currentTime / a.duration * 100;
    this.elements.progressBar.style.width = `${ratio | 0}%`;
  }
  
  play() {
    this.elements.playButton.focus();
    return this.audio.play();
  }
  
  pause() {
    return this.audio.pause();
  }
}

AudioPlayer.define("audio-player", "audio-player.html");