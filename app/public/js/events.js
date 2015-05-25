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
  console.log(d.format('MMMM DD'))
  d.add(1, 'month');
  draw_cal_for()
});

function draw_cal_for() {
  var now = moment().add(1, 'day');
  $sel.val(d.format('MMMM'));
  $.ajax('/events?d=' + d.format('YYYY-MM-DD')).done(function (events) {
    var evtidx = index_events(events);
    var d0 = moment(d);
    d0.startOf('week');
    var $cal = $("#calendar");
    $cal.empty();
    for (var i = 0; i < 5; i++) {
      var $row = $("<div class='row'></div>");
      $cal.append($row);
      for (var j = 0; j < 7; j++) {
        if (j != 0 && j != 6) {
          (function (day, before) {
            var $c = $("<div class='four columns event'></div>");
            if (before)
              $c.addClass('before');
            var $d = $("<div class='event_header'></div>");
            $d.append(d0.format("ddd DD"));
            $c.append($d);
            var id = d0.format('MM-DD');
            if (evtidx[id]) {
              evtidx[id].forEach(function (event) {
                var $d = $("<div class='event_item'></div>");
//                $d.append(event.leader.contact.name);
                $d.append(moment(event.when).format("h:mm a") + " " + event.location)
                if (before)
                  $d.addClass('before');
                if (event.spaces <= event.kids.length)
                  $d.addClass('full');
                $d.click(function () {
                  location.href = '/event/' + event._id;
                });
                $c.append($d);
                console.log(event)
              });
            }
            if (!before) {
              var $add = $("<div class='event_add'><i class='fa fa-plus'></i>  Add</div>");
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
            $row.append($c);
          })(moment(d0), d0.isBefore(now));
        }
        d0.add(1, 'day');
      }
    }
  })
}
function index_events(events) {
  var evtidx = {};
  events.forEach(function (e) {
    var id = moment(e.when).format('MM-DD');
    if (evtidx[id])
      evtidx[id].push(e);
    else
      evtidx[id] = [e];
  });
  return evtidx;
}