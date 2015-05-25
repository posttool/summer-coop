//    <a href="/event/{{event._id}}/update">Edit</a>
//    <a href="/event/create?date=" class="button">Add an Event</a>
var d = moment();

var $last = $("#last-month");
$last.click(function () {
  d.startOf('month');
  d.subtract(1, 'month');
  draw_cal_for()
});

var $sel = $("#select-month");
$sel.change(function () {
  d.month($sel.val());
  d.startOf('month');
  draw_cal_for()
});
var $next = $("#next-month");
$next.click(function () {
  d.startOf('month');
  d.add(1, 'month');
  draw_cal_for()
});

var now = moment().subtract(1, 'day');
var evtidx = {};

function draw_cal_for(day) {
  if (day)
    d = day;
  var $cal = $("#calendar");
  $cal.empty().text('Loading events...');
  $sel.val(d.format('MMMM'));
  $.ajax('/events?d=' + d.format('YYYY-MM-DD')).done(function (events) {
    index_events(events);
    $cal.empty();
    var d0 = moment(d);
    d0.startOf('week');
    for (var i = 0; i < 5; i++) {
      var $row = $("<div class='row'></div>");
      $cal.append($row);
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
  var before = day.isBefore(now);
  var $c = $("<div class='four columns event'></div>");
  if (before)
    $c.addClass('before');
  var $d = $("<div class='event_header'></div>");
  if (day.date() == 1) {
    $d.append(day.format("MMMM D"));
    $c.addClass('first-day-of-month');
  }
  else
    $d.append(day.format("ddd D"));
  $c.append($d);
  var id = day.format('MM-DD');
  if (evtidx[id]) {
    evtidx[id].forEach(function (event) {
      var $d = $("<div class='event_item'></div>");
      //$d.append(event.leader.contact.name);
      $d.append(moment(event.when).format("h:mm a") + " " + event.location)
      if (before)
        $d.addClass('before');
      if (event.spaces <= event.kids.length)
        $d.addClass('full');
      $d.click(function () {
        location.href = '/event/' + event._id;
      });
      $c.append($d);
    });
  }
  if (!before) {
    var $add = $("<div class='event_add'><i class='fa fa-plus'></i> Add an event</div>");
    $add.hide();
    $c.append($add);
    $c.mouseover(function () {
      $add.show();
    });
    $c.mouseout(function () {
      $add.hide();
    });
    $add.click(function () {
      location.href = "/event/create?d=" + day.format('YYYY-MM-DD')
    })
  }
  return $c;
}