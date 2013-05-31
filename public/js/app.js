(function () {
  var H = Handlebars;

  function WHEN() {
    this.data = [];
    this.templates = {
      "entry": Handlebars.compile(document.getElementById('template-entry').innerHTML)
    };
  }

  WHEN.prototype.load = function () {
    var d = localStorage.when;
    if (!d) {
      d = "{}";
    }
    var when, data = JSON.parse(d);
    for (when in data) { if (data.hasOwnProperty(when)) {
      this.data.push({
        when: when,
        actions: data[when].actions
      });
    } }
    return this.data;
  };

  WHEN.prototype.save = function () {
    var save = {};
    this.data.forEach(function (when) {
      save[when.when] = when;
      delete save[when.when].when;
    });
    localStorage.when = JSON.stringify(save);
  };

  WHEN.prototype.render = function () {
    return this.data.map(this.templates.entry).join("");
  };

  document.addEventListener('DOMContentLoaded', function (e) {
    var w = new WHEN(),
      form = document.getElementById("add-entry"),
      whenList = document.querySelector('.when-list');
    w.load();
    whenList.innerHTML = w.render();
    form.addEventListener('keydown', function (e) {
      if (e.which === 13 && e.target.name === "actions[]") {
        e.preventDefault();
        e.stopPropagation();
        var clone = e.target.parentNode.cloneNode(true),
          input = clone.firstChild;
        input.value = "";
        input.removeAttribute('required');
        e.target.parentNode.parentNode.appendChild(clone);
        input.focus();
      }
    }, false);

    form.addEventListener('submit', function (e) {
      if (!e.defaultPrevented) {
        e.preventDefault();
        var values = {when: null, actions: []}, form = e.target;
        [].forEach.call(form, function (input) {
          var value = input.value.trim();
          if (value) {
            if (input.name === "when") {
              values.when = input.value.trim();
            } else if (input.name === "actions[]") {
              values.actions.push(input.value.trim());
            }
          }
        });
        w.data.unshift(values);
        [].forEach.call(form.querySelectorAll('.action'), function (el, i) {
          i && el.parentNode.removeChild(el);
        });
        form.reset();
        whenList.innerHTML = w.render();
        w.save();
      }
    }, false);
  }, false);
}());
