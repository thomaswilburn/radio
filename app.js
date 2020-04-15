/*
Singleton class for the app
Elements can import this to get access to app state
Also handles coordinating between the player and the other UI elements

TODO:
- Add playback memory to the audio class
- Change audio class to start playback via app event subscription, not attributes
- Move subscription logic into this class?
- Add import/export via copy-paste server
- Move adding/removing feeds into the toolbar
- Add better logging/recovery to the audio player - stalled, error, and abort?
*/

class Radio {
  constructor() {
    this.events = {};
    this.track = null;
  }
  
  on(e, callback) {
    if (!this.events[e]) this.events[e] = [];
    this.events[e].push(callback);
  }
  
  off(e, callback) {
    if (!this.events[e]) return;
    this.events[e] = this.events[e].filter(f => f != callback);
  }
  
  fire(e, data) {
    if (!this.events[e]) return;
    console.log(e, this.events[e]);
    this.events[e].forEach(f => f(data));
  }
  
  async read(key) {
    var v = localStorage.getItem(key);
    if (!v) return null;
    return JSON.parse(v);
  }
  
  async write(key, value) {
    var v = JSON.stringify(value);
    localStorage.setItem(key, v);
  }
}

export default new Radio();