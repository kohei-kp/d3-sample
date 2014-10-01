// Map
(function () {
  var svg, projection, path,
      width = 650, height = 650;

  init();

  // CreateSVG
  function init() {
    svg = util.createSVG('#map', width, height),

    projection = d3.geo.mercator()
      .center([139.5, 35.7])
      .translate([width / 2, height / 2])
      .scale([1400]),
    path = d3.geo.path().projection(projection),

    d3.json('../json/japan.topojson', function (d) {
      var features = topojson.feature(d, d.objects.japan).features;

      // 地図の描画
      svg.selectAll('path').data(features).enter()
        .append('path')
        .attr({
          stroke: 'black',
          'stroke-width': '0.5',
          d: path,
          fill: '#669966'
        });

      drawLocation();
    });
  }

  // drawLoation
  function drawLocation() {
    var circle;

    db.getLocationList().done(function (data) {
      var dataset = data.location;

      circle = svg.selectAll('circle').data(dataset).enter().append('circle')
        .attr({
          cx: function (d) {
            return projection([d.lon, d.lat])[0];
          },
          cy: function (d) {
            return projection([d.lon, d.lat])[1];
          },
          r: 0,
          fill: 'red',
          opacity: 1
        })
        .transition(700)
        .attr({
          r:5,
          opacity: 0.6
        });
    });
  }

}());
