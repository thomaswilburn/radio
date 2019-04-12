var facade = {
  "get": async function(key) {
    var v = localStorage.getItem(key);
    if (!v) return null;
    return JSON.parse(v);
  },
  
  "set": async function(key, value) {
    var v = JSON.stringify(value);
    localStorage.setItem(key, v);
  }
};

export default facade;