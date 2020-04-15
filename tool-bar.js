import ElementBase from "./element-base.js";
import app from "./app.js";

class ToolBar extends ElementBase {
  constructor() {
    super();
    this.elements.refreshAll.addEventListener("click", this.onRefreshAll);
    this.elements.tools.addEventListener("change", this.onToolSelect);
  }
  
  static get boundMethods() {
    return ["onRefreshAll"]
  }
  
  onRefreshAll() {
    app.fire("refresh-all");
  }
  
  onToolsSelect() {
    console.log(this.elements.tools.value);
  }
}

ToolBar.define("tool-bar", "tool-bar.html");