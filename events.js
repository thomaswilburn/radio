var events = {};

export default {
  on: function(event, listener) {
    if (!events[event]) events[event] = [];
    events[event].push(listener);
  },

  off: function(event, listener) {
    if (!events[event]) return;
    events[event] = events[event].filter(f => f != listener);
  },

  fire: function(event, ...args) {
    if (!events[event]) return;
    events[event].forEach(f => f(...args));
  }
}