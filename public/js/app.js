(function () {
  var H = Handlebars;

  function WHEN(node) {
    this.node = node;
    this.data = [];
    this.templates = {
      "entry": H.compile(document.getElementById('template-entry').innerHTML),
      "form": H.compile(document.getElementById('template-add-entry').innerHTML)
    };
  }

  WHEN.prototype.load = function () {
    var d = localStorage.when;
    if (!d) {
      d = "[]";
    }
    var when, data = JSON.parse(d);
    for (when in data) { if (data.hasOwnProperty(when)) {
      this.data.push({
        when: when,
        actions: data[when].actions,
        ts: data[when].ts
      });
    } }
    this.data.sort(function (a, b) {
      return b.ts - a.ts;
    });
    return this.data;
  };

  WHEN.prototype.save = function () {
    var save = {};
    this.data.forEach(function (when) {
      save[when.when] = when;
    });
    localStorage.when = JSON.stringify(save);
  };

  WHEN.prototype.render = function () {
    return this.data.map(this.templates.entry).join("");
  };

  WHEN.prototype.get = function (id) {
    return this.data.filter(function (when) {
      return when.when === id;
    })[0];
  };

  WHEN.prototype.put = function (values) {
    for (var i = this.data.length; i -- > 0; ) {
      if (this.data[i].when === values.when) {
        this.data[i] = values;
        return this.data;
      }
    }
    this.data.unshift(values);
    return this.data;
  };

  WHEN.prototype.remove = function (id) {
    return this.data = this.data.filter(function (when) {
      return when.when !== id;
    });
  };

  WHEN.prototype.paint = function () {
    this.node.innerHTML = this.render();
  };

  WHEN.Helper = {
    formKeyHandler: function (e) {
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
    },
    addEscHandler: function (node, fn) {
      node.addEventListener('keyup', function (e) {
        if (e.which === 27) {
          fn.call(node, e);
        }
      }, false);
      return node;
    },
    extractFormValues: function (e) {
      var values = {
          when: null,
          actions: [],
          ts: Date.now()
        },
        form = e.target,
        carry = ["when", "ts"];
      [].forEach.call(form, function (input) {
        var value = input.value.trim();
        if (value) {
          if (carry.indexOf(input.name) !== -1) {
            values[input.name] = input.value.trim();
          } else if (input.name === "actions[]") {
            values.actions.push(input.value.trim());
          }
        }
      });
      return {values: values, form: form};
    },
    getParentWhenNode: function (node) {
      do {
        if (node.classList.contains('editable')) {
          break;
        } else {
          node = node.parentNode || null;
        }
      } while(node);
      return node;
    }
  };


  document.addEventListener('DOMContentLoaded', function (e) {
    var w,
      form = document.getElementById("add-entry"),
      whenList = document.querySelector('.when-list');
    w = new WHEN(whenList);
    w.load();
    w.paint();
    form.addEventListener('keydown', WHEN.Helper.formKeyHandler, false);
    form.addEventListener('submit', function (e) {
      if (!e.defaultPrevented) {
        e.preventDefault();
        var formAndValues = WHEN.Helper.extractFormValues(e),
          form = formAndValues.form;
        [].forEach.call(form.querySelectorAll('.action'), function (el, i) {
          i && el.parentNode.removeChild(el);
        });
        form.reset();
        w.put(formAndValues.values);
        w.paint();
        w.save();
      }
    }, false);

    whenList.addEventListener('click', function (e) {
      if (e.shiftKey) {
        var whenNode = WHEN.Helper.getParentWhenNode(e.srcElement);
        if (whenNode) {
          var id = whenNode.dataset.id;
          console.log(id);
          whenNode.innerHTML = w.templates.form(w.get(id));
          whenNode.querySelector('[name=when]').focus();
          whenNode.addEventListener('keydown', WHEN.Helper.formKeyHandler, false);
          whenNode.addEventListener('submit', function (e) {
            if (!e.defaultPrevented) {
              e.preventDefault();
              var formAndValues = WHEN.Helper.extractFormValues(e),
                form = formAndValues.form,
                values = formAndValues.values;
              w.put(values);
              whenList.innerHTML = w.render();
              w.save();
            }
          }, false);
          whenNode.addEventListener('click', function (e) {
            if (e.srcElement.classList.contains('delete')) {
              if (confirm("really?")) {
                w.remove(id);
                w.paint();
                w.save();
              }
            }
          }, false);
          WHEN.Helper.addEscHandler(whenNode, function (e) {
            w.paint();
          });
        }
      }
    }, false);
    form.innerHTML = w.templates.form({});
    window.WHE = w;
  }, false);
}());
