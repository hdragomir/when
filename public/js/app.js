(function () {
  var H = Handlebars;

  document.addEventListener('DOMContentLoaded', function (e) {
    var w,
      form = document.getElementById("add-entry"),
      whenList = document.querySelector('.when-list'),
      toggleCheckbox = document.getElementById('add-entry-visiblity');
    w = new WHEN(whenList, {
      "entry": H.compile(document.getElementById('template-entry').innerHTML),
      "form": H.compile(document.getElementById('template-add-entry').innerHTML)
    });
    w.load();
    w.paint();
    WHEN.Helper.addEscHandler(whenList, function (e) {
      w.paint();
    });
    whenList.addEventListener('click', function (ev) {
      var classList = ev.srcElement.classList,
        whenNode;
      if (classList.contains('delete')) {
        whenNode = WHEN.Helper.getParentWhenNode(ev.srcElement);
        if (whenNode && confirm('really?')) {
          w.remove(whenNode.dataset.id);
          w.paint();
          w.save();
        }
      } else if (classList.contains('cancel')) {
          w.paint();
      } else if (classList.contains('edit')) {
        WHEN.Helper.editWhenNode(w, WHEN.Helper.getParentWhenNode(ev.srcElement));
      } else if (classList.contains('download')) {
        whenNode = WHEN.Helper.getParentWhenNode(ev.srcElement);
        var whenData = w.get(parseInt(whenNode.dataset.id, 10));
        WHEN.Helper.downloadJSONWithAnchor(ev.srcElement, w.stringify([whenData]), whenData.when + '.json');
      } else {
        window.open(ev.srcElement.href);
        ev.preventDefault();
      }
    }, false);
    form.addEventListener('keydown', WHEN.Helper.formKeyHandler, false);
    form.addEventListener('submit', function (e) {
      if (!e.defaultPrevented) {
        e.preventDefault();
        WHEN.Helper.onFormSubmit(w, e.target);
        toggleCheckbox.checked = false;
      }
    }, false);
    form.addEventListener('click', function (e) {
      if(e.srcElement.classList.contains('cancel')) {
        toggleCheckbox.checked = false;
      }
    }, false);
    form.whenRef = w;
    WHEN.Helper.addEscHandler(form, function (e) {
      toggleCheckbox.checked = false;
    });

    toggleCheckbox.addEventListener('click', function (e) {
      form.querySelector('[name=when]').focus();
    }, false);

    whenList.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey) {
        WHEN.Helper.editWhenNode(w, WHEN.Helper.getParentWhenNode(e.srcElement));
      }
    }, false);
    form.innerHTML = w.templates.form({});
    if (!w.data.length) {
      toggleCheckbox.checked = true;
    }

    document.getElementById('download-data').addEventListener('click', function (ev) {
      WHEN.Helper.downloadJSONWithAnchor(ev.target, w.stringify());
      return true;
    }, true);
    document.getElementById('upload-data').addEventListener('change', function (ev) {
      var file = ev.target.files[0];
      if (file.type === "application/json") {
        var fr = new FileReader();
        fr.addEventListener('load', function (fre) {
          w.eat(JSON.parse(fre.target.result));
          w.paint();
          w.save();
        }, false);
        fr.readAsText(file);
      }
    }, false);
    // just for easier debugging
    window.whe = w;
  }, false);
}());
