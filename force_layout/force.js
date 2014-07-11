// width, height
var w = 1280,
    h = 1280,

// svg
    svg = d3.select('body').append('svg').attr({ 'width': w, 'height': h });

d3.json('./follow.json', function (data) {
  var edges = [],
      i = 0,
      len = data.users.length,
      lines,
      images,
      force;

  // create edges
  for (i = 1; i < len; i += 1) {
    edges.push({ source: 0, target: i });
  }

  // force
  force = d3.layout.force()
    .nodes(data.users)
    .links(edges)
    .size([w, h])
    .linkDistance([300])
    .charge([-500])
    .start();

  // line
  lines = svg.selectAll('line')
    .data(edges)
    .enter()
    .append('line')
    .style({ 'stroke': '#222', 'stroke-width': 1 });

  // images
  images = svg.selectAll('image')
    .data(data.users)
    .enter()
    .append('image')
    .attr({
      'xlink:href': function (d) { return d.profile_image_url; },
      'width': 50,
      'height': 50
    })
    .call(force.drag);

  // tick
  force.on('tick', function () {

    lines.attr({
      'x1': function (d) { return d.source.x; },
      'y1': function (d) { return d.source.y; },
      'x2': function (d) { return d.target.x; },
      'y2': function (d) { return d.target.y; }
    });

    images.attr({
      'x': function (d) { return d.x; },
      'y': function (d) { return d.y; }
    });
  });
});
