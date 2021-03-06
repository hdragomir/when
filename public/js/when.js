(function (scope) {
  function WHEN(node, templates) {
    this.node = node;
    this.data = [];
    this.templates = templates;
  }


  WHEN.prototype.eat = function (data) {
    var when;
    for (when in data) { if (data.hasOwnProperty(when)) {
      this.put({
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

  WHEN.prototype.load = function () {
    var d = localStorage.when;
    if (!d) {
      d = "[]";
    }
    return this.eat(JSON.parse(d));
  };


  WHEN.prototype.stringify = function (data) {
    var save = {};
    data = data || this.data;
    data.forEach(function (when) {
      save[when.when] = when;
    });
    return JSON.stringify(save);
  };

  WHEN.prototype.save = function () {
    localStorage.when = this.stringify();
  };

  WHEN.prototype.render = function () {
    return [].concat(this.data).map(this.preparseEntry, this).map(this.templates.entry).join("");
  };

  WHEN.prototype.preparseEntry = function (entry) {
    entry = WHEN.Helper.merge({}, entry);
    entry.actions = [].concat(entry.actions);
    entry.actions = entry.actions.map(this.preparseAction, this);
    return entry;
  };

  WHEN.prototype.preparseAction = function (action) {
    return action.replace(/<+/g, '&lt;').replace(/\[(.+?)\]\((.+?)\)/g, "<a href=\"$2\">$1</a>").replace(/(?:([`*_])(.+?)\1)(?=\W|$)/g, this.markdownHelper);
  };

  WHEN.prototype.markdownHelper = function (matched, token, content) {
    var tag = {"`" : "code", "*": "b", "_": "i"}[token];
    return "<" + tag + ">" + content + "</" + tag + ">";
  };

  WHEN.prototype.get = function (id) {
    id = parseInt(id, 10);
    return this.data.filter(function (when) {
      return when && when.ts === id;
    })[0];
  };

  WHEN.prototype.put = function (values) {
    values.ts = parseInt(values.ts, 10);
    for (var i = this.data.length; i -- > 0; ) {
      if (this.data[i].ts === values.ts) {
        this.data[i] = values;
        return this.data;
      }
    }
    this.data.unshift(values);
    return this.data;
  };

  WHEN.prototype.remove = function (id) {
    id = parseInt(id, 10);
    return this.data = this.data.filter(function (when) {
      return when.ts !== id;
    });
  };

  WHEN.prototype.paint = function () {
    this.node.innerHTML = this.render();
    this.node.classList.remove('editing');
  };

  WHEN.Helper = {

    formKeyHandler: function (e) {
      if (e.target.name === "actions[]" && e.target.nodeName.toLowerCase() === "input") {
        if (e.which === 13) {
          e.preventDefault();
          e.stopPropagation();
          WHEN.Helper.addActionsInput(e.target).focus();
        } else {
          if (! e.target.dataset.cloned && e.which > 40) {
            WHEN.Helper.addActionsInput(e.target);
          }
        }
      }
    },

    addActionsInput: function (targetInput) {
      var clone = targetInput.parentNode.cloneNode(true),
        input = clone.firstChild;
      targetInput.dataset.cloned = true;
      input.value = "";
      input.removeAttribute('required');
      targetInput.parentNode.parentNode.appendChild(clone);
      return input;
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
        form = e,
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
    },

    onFormSubmit: function (w, form) {
      var formAndValues = WHEN.Helper.extractFormValues(form),
        form = formAndValues.form;
      form.parentNode.innerHTML = w.templates.form({});
      w.put(formAndValues.values);
      w.paint();
      w.save();
    },

    editWhenNode: function (w, whenNode) {
      if (whenNode) {
        whenNode.classList.add('editing');
        whenNode.parentNode.classList.add('editing');
        var id = whenNode.dataset.id;
        whenNode.innerHTML = w.templates.form(w.get(id));
        whenNode.querySelector('[name=when]').focus();
        whenNode.addEventListener('keydown', WHEN.Helper.formKeyHandler, false);
        whenNode.addEventListener('submit', function (e) {
          if (!e.defaultPrevented) {
            e.preventDefault();
            WHEN.Helper.onFormSubmit(w, e.target);
          }
        }, false);
      }
    },

    downloadJSONWithAnchor: function (anchor, data, name) {
      var jsonData = encodeURIComponent(data);
      anchor.download = name || "when-data-" + Date.now() + ".json";
      anchor.href= "data:application/octet-stream;charset=utf-8," + jsonData;
      return anchor;
    },

    merge: function (into) {
      for (var prop, i = 1, l = arguments.length; i < l; i++) {
        for (prop in arguments[i]) if (arguments[i].hasOwnProperty(prop)) {
          into[prop] = arguments[i][prop];
        }
      }
      return into;
    }
  };

  scope.WHEN = WHEN;
}(window));
