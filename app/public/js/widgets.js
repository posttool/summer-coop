function alert(title, $pane, on_close) {
  var $c = $$().addClass('alert-gauze');
  var $d = $$().addClass('alert-wrap');
  var $a = $$($d).addClass('alert');
  var $h = $$($a).addClass('head');
  var $p = $$($a).addClass('content');
  var $b = $$($a).addClass('buttons')
  var $ok = $$($b).text('ok');
  var $cancel = $$($b).text('cancel');
  $(document.body).append($c);
  $(document.body).append($d);
  function empty() {
    $d.remove();
    $c.remove();
  }

  $h.text(title);
  $p.append($pane);
  $c.click(empty);
  $ok.click(function () {
    empty();
    on_close();
  });
  $cancel.click(empty)
}

// labeled input...
function labeled_input(message) {
  var self = this;
  string_component(self, message, "<input type=\"text\">");
}

// text area
function labeled_textarea(message) {
  var self = this;
  string_component(self, message, "<textarea></textarea>");
}

// simple component !
function string_component(self, message, component) {
  eventify(self);
  valuable(self, update, '');
  var $c = $elify(self, 'control');
  var $l = $("<label>" + message + "</label>");
  var $i = $(component);
  $c.append($l, $i);

  function update() {
    $i.val(self._data);
  }

  $i.on('change', function () {
    self._data = $i.val();
    self.emit('change');
  })
}