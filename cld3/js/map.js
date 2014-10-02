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

      //drawLocation();
    });
  }

  // drawLoation
  function drawLocation() {
    var circle;

    db.getLocationList('20140801', '20140826').done(function (data) {
      //var dataset = data.location;
      db.getLonLat(data).done(function (data2) {
        var i = 0, len = data.length, len2 = data2.length;

        for (i = 0; i < len; i += 1) {
          data[i].city = data2[i].city_en ? data2[i].city_en : 'JP';
          data[i].lon = data2[i].lon;
          data[i].lat = data2[i].lat;
          data[i].action = data[i].history_id == '1' ? 'アップロード' : '配布ファイルのダウンロード';
        }
        circle = svg.selectAll('circle').data(data).enter().append('circle')
          .attr({
            cx: function (d) {
              return projection([d.lon, d.lat])[0];
            },
            cy: function (d) {
              return projection([d.lon, d.lat])[1];
            },
            r: 0,
            fill: function (d) { 
              return d.history_id == '1' ? 'blue' : 'red';
            },
            opacity: 0
          })
          .transition(700)
          .attr({
            r: 5,
            opacity: 0.8
          });

        createTable(data);
      });
    });
  }

  // createTable
  function createTable(data) {
    var table = '<tr><th>Date</th><th>Location</th><th>Action</th></tr>',
        i = 0, len = data.length;

    for (i = 0; i < len; i += 1) {
      table += '<tr><td>' + data[i].in_dt + '</td><td>' + data[i].city + '</td><td>' +
               data[i].action + '</td></tr>';

    }
    $('#action-table').append(table);
  }

  d3.select('#location-plot').on('click', function () {
    drawLocation();
  });

}());
