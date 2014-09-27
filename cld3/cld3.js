var //db = new WF_LOG.DatabaseAccess(),
    //upsize = db.getCountUpSize(),
    //login = db.getHourLogin(),
    //datas = [],
    map, projection;

createPunchCard();
createJapanMap();
// Weekly Login Chart
function createPunchCard() {
  var width = 800, height = 400, padding = 80;

  // days and hours
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      hours = [
        '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a',
        '8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p',
        '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'
      ];

  // dataset example
  var dataset = [
    // sunday
    {'DAY_COUNT': '1', 'COUNT': '22', 'HOUR': '2'},
    {'DAY_COUNT': '1', 'COUNT': '2', 'HOUR': '4'},
    {'DAY_COUNT': '1', 'COUNT': '66', 'HOUR': '8'},
    {'DAY_COUNT': '1', 'COUNT': '123', 'HOUR': '10'},
    {'DAY_COUNT': '1', 'COUNT': '45', 'HOUR': '12'},
    {'DAY_COUNT': '1', 'COUNT': '62', 'HOUR': '13'},
    {'DAY_COUNT': '1', 'COUNT': '32', 'HOUR': '16'},

    // monday
    {'DAY_COUNT': '2', 'COUNT': '11', 'HOUR': '0'},
    {'DAY_COUNT': '2', 'COUNT': '1', 'HOUR': '8'},
    {'DAY_COUNT': '2', 'COUNT': '88', 'HOUR': '9'},
    {'DAY_COUNT': '2', 'COUNT': '100', 'HOUR': '11'},
    {'DAY_COUNT': '2', 'COUNT': '33', 'HOUR': '15'},
    {'DAY_COUNT': '2', 'COUNT': '67', 'HOUR': '16'},
    {'DAY_COUNT': '2', 'COUNT': '77', 'HOUR': '17'},

    // tuesday
    {'DAY_COUNT': '3', 'COUNT': '21', 'HOUR': '3'},
    {'DAY_COUNT': '3', 'COUNT': '4', 'HOUR': '5'},
    {'DAY_COUNT': '3', 'COUNT': '7', 'HOUR': '7'},
    {'DAY_COUNT': '3', 'COUNT': '66', 'HOUR': '13'},
    {'DAY_COUNT': '3', 'COUNT': '22', 'HOUR': '14'},
    {'DAY_COUNT': '3', 'COUNT': '11', 'HOUR': '15'},
    {'DAY_COUNT': '3', 'COUNT': '99', 'HOUR': '22'},

    // wednesday
    {'DAY_COUNT': '4', 'COUNT': '2', 'HOUR': '4'},
    {'DAY_COUNT': '4', 'COUNT': '2', 'HOUR': '6'},
    {'DAY_COUNT': '4', 'COUNT': '1', 'HOUR': '10'},
    {'DAY_COUNT': '4', 'COUNT': '12', 'HOUR': '12'},
    {'DAY_COUNT': '4', 'COUNT': '12', 'HOUR': '16'},
    {'DAY_COUNT': '4', 'COUNT': '20', 'HOUR': '17'},
    {'DAY_COUNT': '4', 'COUNT': '11', 'HOUR': '23'},

    // thursday
    {'DAY_COUNT': '5', 'COUNT': '22', 'HOUR': '8'},
    {'DAY_COUNT': '5', 'COUNT': '30', 'HOUR': '9'},
    {'DAY_COUNT': '5', 'COUNT': '40', 'HOUR': '10'},
    {'DAY_COUNT': '5', 'COUNT': '15', 'HOUR': '12'},
    {'DAY_COUNT': '5', 'COUNT': '12', 'HOUR': '14'},
    {'DAY_COUNT': '5', 'COUNT': '50', 'HOUR': '17'},
    {'DAY_COUNT': '5', 'COUNT': '32', 'HOUR': '20'},

    // friday
    {'DAY_COUNT': '6', 'COUNT': '10', 'HOUR': '9'},
    {'DAY_COUNT': '6', 'COUNT': '40', 'HOUR': '11'},
    {'DAY_COUNT': '6', 'COUNT': '50', 'HOUR': '13'},
    {'DAY_COUNT': '6', 'COUNT': '60', 'HOUR': '15'},
    {'DAY_COUNT': '6', 'COUNT': '70', 'HOUR': '17'},
    {'DAY_COUNT': '6', 'COUNT': '60', 'HOUR': '19'},
    {'DAY_COUNT': '6', 'COUNT': '32', 'HOUR': '21'},

    // saturday
    {'DAY_COUNT': '7', 'COUNT': '9', 'HOUR': '0'},
    {'DAY_COUNT': '7', 'COUNT': '2', 'HOUR': '1'},
    {'DAY_COUNT': '7', 'COUNT': '1', 'HOUR': '3'},
    {'DAY_COUNT': '7', 'COUNT': '4', 'HOUR': '8'},
    {'DAY_COUNT': '7', 'COUNT': '9', 'HOUR': '10'},
    {'DAY_COUNT': '7', 'COUNT': '4', 'HOUR': '16'},
    {'DAY_COUNT': '7', 'COUNT': '2', 'HOUR': '18'}

  ];

  // svg
  var svg = d3.select('#login').append('svg').attr({ width: width, height: height});

  // group
  var day = svg.append('g'),
      hour = svg.append('g'),
      circle = svg.append('g');

  var x = {min: 0, max: width - padding, step: (width - 80) / 24},
      y = {min: 0, max: height - 30, step: (height - 30) / 7},
      z;

  var dayAxis, hourAxis;

  // xAxis
  dayAxis = day.selectAll('text').data(days).enter().append('text');
  dayAxis.attr({
    'x': 0,
    'y': function (d) {
      return y.step * (days.indexOf(d) + 1);
    }
  })
  .text(function (d) { return d; })
  .attr({
    'font-family': 'sans-serif',
    'font-size': '12px'
  });

  // yAxis
  hourTxt = hour.selectAll('text').data(hours).enter().append('text');
  hourTxt.attr({
    'x': function (d) {
      return x.step * (hours.indexOf(d) + 1) + 40;
    },
    'y': y.max + 20
  })
  .text(function (d) { return d; })
  .attr({
    'font-family': 'sans-serif',
    'font-size': '12px'
  });


  var datas = [], scaleData = [];

  dataset.forEach(function (d, i) {
    datas[i] = [parseInt(d.DAY_COUNT), parseInt(d.COUNT), parseInt(d.HOUR)];
    scaleData[i] = parseInt(d.COUNT);
  });

  var domain = [d3.min(scaleData), d3.max(scaleData)];

  z = d3.scale.linear().domain(domain).range([4, 15]);

  var i = 0, len = datas.length, cache, logins,
      cx, cy, r, title;

  circle.selectAll('circle').data(datas).enter().append('circle')
    .attr({
      cx: function (d) {
        return x.step * (d[2] + 1) + 50;
      },
      cy: function (d) {
        return y.step * (d[0]);
      },
      r: 0,
      title: function (d) {
        return 'Login:' + d[1];
      },
      id: function (d) {
        return d[1];
      },
      class: 'hover-circle',
      fill: '#3A3A3A'
    })
    .on('mouseover', function (d) {
      d3.select(this).attr('fill', 'steelblue');

      var xPos = parseFloat(d3.select(this).attr('cx')) - 40,
          yPos = parseFloat(d3.select(this).attr('cy')) - 40;

      svg.append('rect')
      .attr({
        id: 'tooltip-rect',
        x: xPos, y: yPos, rx: 6, ry: 6,
        width: 90, height: 25,
        fill: '#444444', stroke: '#C3C3C3', 'stroke-width': 1
      });

      svg.append('text')
      .attr({
        id: 'tooltip',
        x: xPos + 47,
        y: yPos + 16,
        'text-anchor': 'middle',
        'font-family': 'sans-serif',
        'font-size': '11px',
        'font-weight': 'bold',
        'fill': 'white'
      })
      .text(d3.select(this).attr('id') + ' Logins');
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', '#3A3A3A');
      d3.select('#tooltip').remove();
      d3.select('#tooltip-rect').remove();
    })
    .transition()
    .duration(700)
    .attr({
      r: function (d) {
        return z(d[1]);
      }
    });
}

function createJapanMap() {
  d3.json('../json/japan.topojson', function (d) {
    var w = 650, h = 650, path, circle,
        features = topojson.feature(d, d.objects.japan).features;

    var dataset = [
      { 'Prefecture': 'Kobe' , 'lon': '135.195', 'lat': '34.690' },
      { 'Prefecture': 'Tokyo' , 'lon': '139.691', 'lat': '35.089' },
      { 'Prefecture': 'Hokkaido' , 'lon': '141.346', 'lat': '43.064' },
      { 'Prefecture': 'Fukuoka' , 'lon': '130.407', 'lat': '33.590' },
      { 'Prefecture': 'Tokushima' , 'lon': '134.559', 'lat': '34.065' },
      { 'Prefecture': 'Osaka' , 'lon': '135.502', 'lat': '34.693' },
      { 'Prefecture': 'Nigata' , 'lon': '139.036', 'lat': '37.916' },
      { 'Prefecture': 'Iwate' , 'lon': '139.036', 'lat': '37.916' }
    ];

    projection = d3.geo.mercator()
      .center([139.5, 35.7])
      .translate([w / 2, h /2])
      .scale([1400]),
    path = d3.geo.path().projection(projection),

    map = d3.select('#map').append('svg').attr({ width: w, height: h }),

    map.selectAll('path').data(features).enter()
      .append('path')
      .attr({
        stroke: 'black',
        'stroke-width': '0.5',
        d: path,
        fill: '#669966'
      });

    circle = map.selectAll('circle').data(dataset).enter()
      .append('circle')
      .attr({
        cx: function (d) {
          return projection([d.lon, d.lat])[0];
        },
        cy: function (d) {
          return projection([d.lon, d.lat])[1];
        },
        r: 1,
        fill: 'red',
        opacity: 1
      })
      .transition()
      .duration(700)
      .attr({
        r: 5,
        opacity: 0.6
      });
  });
}


/*
$(function () {
  // 地図へのマッピング
  $('#mapping-btn').click(function () {
    var from = $('#from-map').val(), to = $('#to-map').val();

    map.selectAll('circle')
      .transition()
      .duration(1000)
      .attr('r', 0)
      .attr('opacity', 0.1)
      .remove();
    // IPアドレス取得
    db.getUpIp(from, to)
    .done(function (d) {
      // 緯度経度取得
      db.getLonLat(d)
      .done(function (d) {
        var circle;

        circle = map.selectAll('circle').data(d).enter()
          .append('circle')
          .attr({
            cx: function (d) {
              return projection([d.lon, d.lat])[0];
            },
            cy: function (d) {
              return projection([d.lon, d.lat])[1];
            },
            r: 1,
            fill: 'red',
            opacity: 1
          })
          .transition()
          .duration(700)
          .attr({
            r: 5,
            opacity: 0.6
          });
      });
    });
  });

  // アップロード回数のエリアグラフ
  $('#up-graph-btn').click(function () {
    var from = $('#from-upload').val(), to = $('#to-upload').val();

    db.getCountUpSize(from, to)
    .done(function (data) {
      // 変数定義
      var parseDate = d3.time.format('%Y-%m-%d').parse,
          // データの最大値、最小値
          dateExtent, countMax,

          // 上位グラフ用
          margin = { top: 10, right: 10, bottom: 100, left: 40 },
          w = 960 - margin.left - margin.right,
          h = 500 - margin.top - margin.bottom,

          // 下位グラフ用
          margin2 = { top: 430, right: 10, bottom: 20, left: 40 },
          h2 = 500 - margin2.top - margin2.bottom,

          // スケール
          xScale, yScale, x2Scale, y2Scale,

          // 軸
          xAxis, yAxis, xAxis2,

          // svg要素
          svg,

          // グラフ関係
          area, area2, focus, context, brush;

      // データの型変換
      data.forEach(function (d) {
        d.date = parseDate(d.date);
        d.count = parseInt(d.count);
      });

      dateExtent = d3.extent(data.map(F('date'))); // dateの最小値、最大値
      countMax = d3.max(data.map(F('count'))); // upload回数の最大値

      xScale = d3.time.scale().domain(dateExtent).range([0, w]);
      yScale = d3.scale.linear().domain([0, countMax]).range([h, 0]);

      xAxis = d3.svg.axis().scale(xScale).orient('bottom');
      yAxis = d3.svg.axis().scale(yScale).orient('left');

      x2Scale = d3.time.scale().domain(xScale.domain()).range([0, w]);
      y2Scale = d3.scale.linear().domain(yScale.domain()).range([h2, 0]);
      xAxis2 = d3.svg.axis().scale(x2Scale).orient('bottom');

      // 上位グラフarea
      area = d3.svg.area()
        .interpolate('monotone')
        .x(F('date', xScale))
        .y0(h)
        .y1(F('count', yScale));

      // 下位グラフarea
      area2 = d3.svg.area()
        .interpolate('monotone')
        .x(F('date', x2Scale))
        .y0(h2)
        .y1(F('count', y2Scale));

      // svg要素
      svg = d3.select('#upload').append('svg')
      .attr({
        width: w + margin.left + margin.right,
        height: h + margin.top + margin.bottom,
        class: 'area'
      });

      // フォーカス時の上位グラフの表示位置調整 クリックパス作成
      svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('rect')
        .attr({
          width: w,
          height: h
        });

      // 上位グラフグループ
      focus = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // 下位グラフグループ
      context = svg.append('g')
        .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')');

      focus.append('path')
        .datum(data)
        .attr({
          'clip-path': 'url(#clip)',
          'd': area
        });

      // x目盛
      focus.append('g')
        .attr({
          'class': 'x axis',
          'transform': 'translate(0,' + h + ')'
        })
        .call(xAxis);

      // y目盛
      focus.append('g').attr('class', 'y axis').call(yAxis);

      // 下位グラフ側
      context.append('path').datum(data).attr('d', area2);

      // 下位x目盛
      context.append('g')
        .attr({
          'class': 'x axis',
          'transform': 'translate(0,' + h2 + ')'
        })
        .call(xAxis2);

      // brush生成
      brush = d3.svg.brush().x(x2Scale).on('brush', brushed);

      context.append('g')
        .attr('class', 'x brush')
        .call(brush)
        .selectAll('rect')
        .attr({
          'y': -6,
          'height': h2 + 7
        });

      function brushed() {
        xScale.domain(brush.empty() ? x2Scale.domain() : brush.extent());
        focus.select('path').attr('d', area); // 上位グラフUpdate
        focus.select('.x.axis').call(xAxis); // x軸Update
      }
    });
  });
});
*/
/**-----------------------------------------
 * realTIme test
 * -----------------------------------------*/
/*
db.getHourUpSize()
.done(function (data) {
  var n = 100, duration = 700, count = 0;
  var parseDate = d3.time.format('%Y-%m-%d %H').parse;

  // データ変換
  data.forEach(function (d) {
    d.date = parseDate(d.date);
    d.count = parseInt(d.count);
    d.up_size = parseInt(d.up_size) / 1000000;
  });
  var now = data[0].date;
  var data2 = [];
  var len = data.length;
  for(var i = 0; i < n; i += 1) {
    data2[i] = data[i];
  }

  var margin = { top: 6, right: 0, bottom: 20, left: 0 },
      width = 960 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var xScale = d3.time.scale()
    .domain([now - (n - 2) * duration, data[n + count].date - duration])
    .range([0, width]);

  var yScale = d3.scale.linear()
    .range([height, 0]);

  var line = d3.svg.line()
    .interpolate('basis')
    .x(function (d, i) { return xScale(d.date); })
    .y(function (d, i) { return yScale(d.up_size); });

  var svg = d3.select('#realtime').append('svg')
    .attr({
      'width': width + margin.left + margin.right,
      'height': height + margin.top + margin.bottom
    })
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('defs').append('clipPath')
    .attr('id', 'crip')
    .append('rect')
    .attr({
      'width': width,
      'height': height
    });

  var axis = svg.append('g')
    .attr({
      'class': 'x axis',
      'transform': 'translate(0,' + height + ')'
    })
    .call(xScale.axis = d3.svg.axis().scale(xScale).orient('bottom'));

  var path = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .append('path')
    .data([data2])
    .attr('class', 'line');

  count += 1;
  tick();

  function tick() {
    now = data[count].date;

    xScale.domain([now - (n - 2) * duration, data2[n - 1].date]);
    yScale.domain(d3.extent(data2, function(d) { return d.up_size; }));

    data2.push(data[n + count]);
    svg.select('.line')
      .attr({
        'd': line,
        'transform': null
      });

    axis.transition()
      .duration(duration)
      .ease('linear')
      .call(xScale.axis);

    path.transition()
      .duration(duration)
      .ease('linear')
      .attr('transform', 'translate(' + xScale(now - (n - 1) * duration) + ')')
      .each('end', tick);

    data2.shift();

    if (n + count == len - 1) {
      count = 0;
    } else {
      ++count;
    }
  }
});*/
