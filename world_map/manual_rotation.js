var earth,
    w = 500,
    h = 500,
// projection
    projection = d3.geo.orthographic()
      .scale(200)
      .translate([w /2, h / 2])
      .clipAngle(90),

// path
    path = d3.geo.path()
      .projection(projection),

// svg
    svg = d3.select('body')
      .append('svg')
      .attr({
        'width': w,
        'height': h
      })
      .on('mousedown', mousedown);

svg.append('circle')
    .attr({
      cx: w / 2,
      cy: h / 2,
      r: 200,
      fill: '#333399'
    });

d3.json('../json/world.topojson', function(data) {
  var features = topojson.feature(data, data.objects.world).features;

  earth = svg.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr({
      'd': path,
      'fill': '#669966'
    });
});

// select window
d3.select(window)
  .on({
    'mousemove': mousemove,
    'mouseup': mouseup
  });

var m0, r0;

// event function
function mousedown() {
  m0 = [d3.event.pageX, d3.event.pageY];
  r0 = projection.rotate();
  d3.event.preventDefault();
}

function mousemove() {
  if (m0) {
    var m1 = [d3.event.pageX, d3.event.pageY];
    var r1 = [r0[0] + (m1[0] - m0[0]) / 3, r0[1] + (m0[1] - m1[1]) / 3];
    projection.rotate(r1);
    earth.attr('d', path);
  }
}

function mouseup() {
  if (m0) {
    mousemove();
    m0 = null;
  }
}

function refresh(duration) {
  (duration ? feature.transtion().duration(duration) : feature).attr('d', path);
}
