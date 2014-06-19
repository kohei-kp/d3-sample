var w = 500,
    h = 500,
    x = 220,
    y = 0,
    z = 0,

// projection
  projection = d3.geo.orthographic()
    .scale(200)
    .translate([w / 2, h /2])
    .clipAngle(180)
    .rotate([x, y, z]),

// path
  path = d3.geo.path()
    .projection(projection),

// svg
  svg = d3.select('body').append('svg')
    .attr({
      'width': w,
      'height': h
    });

  svg.append('circle')
    .attr({
      cx: w / 2,
      cy: h / 2,
      r: 200,
      fill: '#333399'
    });

d3.json('../json/world.topojson', function (data) {
  var features = topojson.feature(data, data.objects.world).features;

  var earth = svg.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr({
      'stroke': 'black',
      'stroke-width': '0.2',
      'd': path,
      'fill': '#669966'
    })
    .on({
      'mouseover': function (d) {
        d3.select(this).attr('fill', 'red');
      },
      'mouseout': function (d) {
        d3.select(this).attr('fill', '#669966');
      }
    });

  d3.timer(function () {
    x += 5;
    y += 1;
    z += 1;
    projection.rotate([x, y, z]);
    earth.attr('d', path);
  }, 500);

});

