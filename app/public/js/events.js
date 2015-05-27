var now = moment();
var evtidx = {};
var d = moment();
var u = null;

function init_cal(user, day) {
  u = user;
  d = day;
  draw_cal_for();
}
function draw_cal_for() {
  var $cal = $('#calendar');
  $cal.empty().text('Loading events...');
  $sel.val(d.format('MMMM'));
  $.ajax('/events?d=' + d.format('YYYY-MM-DD')).done(function (events) {
    index_events(events);
    $cal.empty();
    var $t = $("<table></table>");
    $cal.append($t);
    var d0 = moment(d);
    d0.startOf('month');
    d0.startOf('week');
    for (var i = 0; i < 5; i++) {
      var $row = $('<tr valign="top"></tr>');
      $t.append($row);
      for (var j = 0; j < 7; j++) {
        var $c = get_calendar_item(moment(d0));
        $row.append($c);
        d0.add(1, 'day');
      }
    }
  })
}
function index_events(events) {
  evtidx = {};
  events.forEach(function (e) {
    var id = moment(e.when).format('MM-DD');
    if (evtidx[id])
      evtidx[id].push(e);
    else
      evtidx[id] = [e];
  });
  return evtidx;
}
function get_calendar_item(day) {
  var before = day.isBefore(moment(now).subtract(1, 'day'));
  var $c = $('<td class="event"></td>');
  if (before)
    $c.addClass('before');
  var $d = $('<div class="event_header"></div>');
  if (day.date() == 1) {
    $d.append(day.format('MMMM D'));
    $c.addClass('first-day-of-month');
  }
  else
    $d.append(day.format('ddd D'));
  if (day.month() == d.month()) {
    $d.css({"font-weight": "bold"})
  }
  if (day.month() == now.month() && day.date() == now.date())
    $c.addClass('today');
  $c.append($d);
  var id = day.format('MM-DD');
  if (evtidx[id]) {
    evtidx[id].forEach(function (event) {
      var $d = $('<div class="event_item"></div>');
      var x = '';
      if (event.leader && event.leader._id == u)
        x = '<i class="fa fa-star"></i> ';
      var hr = moment(event.when).format('ha');
      $d.append(x + hr + ' ' + event.location + ' / ' + event.leader.contact.name);
      if (before)
        $d.addClass('before');
      if (event.spaces <= event.kids.length)
        $d.addClass('full');
      else
        $d.addClass('available');
      $d.click(function () {
        location.href = '/event/' + event._id;
      });
      $c.append($d);
    });
  }
  if (!before) {
    var $add = $('<div class="event_add"><i class="fa fa-plus"></i> Add an event</div>');
    $add.hide();
    $c.append($add);
    $c.mouseover(function () {
      $add.show();
    });
    $c.mouseout(function () {
      $add.hide();
    });
    $add.click(function () {
      location.href = '/event/create?d=' + day.format('YYYY-MM-DD')
    })
  }
  return $c;
}

// prev <select month> next
var $last = $('#last-month');
$last.click(function () {
  d.startOf('month');
  d.subtract(1, 'month');
  draw_cal_for()
});

var $sel = $('#select-month');
$sel.change(function () {
  d.month($sel.val());
  d.startOf('month');
  draw_cal_for()
});
var $next = $('#next-month');
$next.click(function () {
  d.startOf('month');
  d.add(1, 'month');
  draw_cal_for()
});