// width height
var w = 500,
    h = 400,

// projection
    projection = d3.geo.mercator()
      .center([139.5, 35.7])
      .translate([w/2, h/2])
      .scale([800]),

// path generator
    path = d3.geo.path()
      .projection(projection),

// svg
    svg = d3.select('body')
      .append('svg')
      .attr({
        'width': w,
        'height': h
      });

// json
d3.json('./japan.topojson', function(data){
  // features
  var features = topojson.feature(data, data.objects.japan);

  svg.append('path')
    .datum(features)
    .attr({
      'stroke': 'black',
      'stroke-width': '0.5',
      'd': path
    })
    .style('fill', '#669966');
});
