(function () {
  var data = {
    "setting this up": {
      "actions": [
        "setup js",
        "setup css",
        "use local storage",
        "add magic",
        "put on google chrome store"
      ]
    },
    "doing the css": {
      "actions": [
        "focus on the list first",
        "focus on the add button",
        "setup a proper form"
      ]
    }
  },
    H = Handlebars;

  function WHEN() {
    this.data = null;
    this.templates = {
      "entry": Handlebars.compile(document.getElementById('template-entry').innerHTML)
    };
  }

  WHEN.prototype.load = function () {
    this.data = data;
  };

  WHEN.prototype.render = function () {
    var list = "";
    for (when in this.data) { if (data.hasOwnProperty(when)){
      list += this.templates.entry({when: when, data: data[when]});
    } }
    return list;
  };

  document.addEventListener('DOMContentLoaded', function (e) {
    var w = new WHEN();
    w.load();
    document.querySelector('.when-list').innerHTML = w.render();
  }, false);
}());
