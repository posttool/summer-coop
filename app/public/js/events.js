function draw_cal_for(d) {
  $.ajax('/events?d=' + d.format('YYYY-MM-DD')).done(function (events) {
    var evtidx = index_events(events);
    d.startOf('week');
    var $cal = $("#calendar");
    $cal.empty();
    for (var i = 0; i < 4; i++) {
      var $row = $("<div class='row'></div>");
      $cal.append($row);
      for (var j = 0; j < 7; j++) {
        if (j != 0 && j != 6) {
          var $c = $("<div class='four columns event'></div>");
          var $d = $("<div class='event_header'></div>");
          $d.append(d.format("dddd DD"));
          $c.append($d);
          var id = d.format('MM-DD');
          if (evtidx[id]) {
            evtidx[id].forEach(function (event) {
              var $d = $("<div class='event_item'></div>");
              $d.click(function () {
                location.href = '/event/' + event._id;
              })
              $d.append(event.leader.contact.name);
              if (event.spaces < event.kids.length)
                $d.addClass('full');
              $c.append($d);
              console.log(event)
            })
          }
          $row.append($c);
        }
        d.add(1, 'day');
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