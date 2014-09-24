var db = new WF_LOG.DatabaseAccess(),
    //upsize = db.getCountUpSize(),
    login = db.getHourLogin(),
    datas = [],
    map, projection;

login.done(function (data) {
  var h = 500, w = 960,
      padding = 80,

      // days
      days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday','Saturday'],

      // hours
      hours = [
        '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', 
        '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm',
        '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'
      ],

      // palette
      palette = d3.select('#login').append('svg').attr({ width: w, height: h}),

      // groups
      dayGroup = palette.append('g'),
      hourGroup = palette.append('g'),
      circleGroup = palette.append('g'),

      x = {min: 0, max: w - padding, step: (w - padding) / 24},

      y = {min: 0, max: h - 30, step: (h - 30) / 7},

      // append days
      dayText = dayGroup.selectAll('text').data(days).enter().append('text'),
      dayLabels = dayText.attr({
        'x': 0,
        'y': function (d) {
          return y.step * (days.indexOf(d) + 1);
        }
      })
      .text(function (d) { return d; })
      .attr({
        'font-family': 'sams-serif',
        'font-size': '12px'
      }),

      // append hour
      hourText = hourGroup.selectAll('text').data(hours).enter().append('text'),
      hourLabels = hourText.attr({
        'x': function (d) {
          return x.step * (hours.indexOf(d) + 1) + 32;
        },
        'y': y.max + 20
      })
      .text(function (d) { return d; })
      .attr({
        'font-family': 'sans-serif',
        'font-size': '12px'
      }),

      // scale
      scaleData = [],
      datas = [],
      z,
      c,
      tuple, logins,
      cy, cx, r, title;

    data.forEach(function (d, i) {
      datas[i] = [parseInt(d.DAY_COUNT) ,parseInt(d.COUNT), parseInt(d.HOUR)];
      scaleData[i] = parseInt(d.COUNT);
    });

    z = {
      data: scaleData
    };

    z.max = d3.max(z.data);
    z.min = d3.min(z.data);
    z.domain = [z.min, z.max];
    z.range = [4, 15];
    z.scale = d3.scale.linear().domain(z.domain).range(z.range);

    for (var i in datas) {
      tuple = datas[i];
      logins = tuple[1];

      if (logins > 0) {
        cy = y.step * (tuple[0] + 1);
        cx = x.step * (tuple[2] + 1) + 50;
        r = z.scale(logins);
        title = 'Login:' + logins;

        c = circleGroup.append('circle')
          .attr({
            cx: cx,
            cy: cy,
            r: r,
            id: logins,
            title: title,
            class: 'hover-circle'
          })
          .on('mouseover', function (d) {
            d3.select(this).attr('fill', 'orange');

            var xPos = parseFloat(d3.select(this).attr('cx')) + 20,
                yPos = parseFloat(d3.select(this).attr('cy')) - 20;

            palette.append('text')
              .attr({
                'id': 'tooltip',
                'x': xPos,
                'y': yPos,
                'text-anchor': 'middle',
                'font-family': 'sans-serif',
                'font-size': '11px',
                'font-weight': 'bold',
                'fill': 'black'
              })
              .text(d3.select(this).attr('id'));
          })
          .on('mouseout', function () {
            d3.select(this).attr('fill', 'black');
            d3.select('#tooltip').remove();
          });
      }
    }
});

d3.json('json/japan.topojson', function (d) {
  var w = 1200, h = 800, path,
      features = topojson.feature(d, d.objects.japan).features;

  projection = d3.geo.mercator()
    .center([139.5, 35.7])
    .translate([w / 2, h /2])
    .scale([1600]),
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
});

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
        console.log(d);
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

/**-----------------------------------------
 * realTIme test
 * -----------------------------------------*/
db.getHourUpSize().done(function (data) {
  var n = 243,
      duration = 750;

  var margin = { top: 6, right: 0, bottom: 20, left: 40 },
      width = 960 - margin.right,
      height = 350 - margin.top - margin.bottom;
  
  var parseDate = d3.time.format('%Y-%m-%d %H').parse;

  var dates = [], up_sizes = [];
  // データ変換
  data.forEach(function (d) {
    d.date = parseDate(d.date);
    d.count = parseInt(d.count);
    d.up_size = parseInt(d.up_size);
    up_sizes.push(d.up_size);
  });
  
  var dateExtent = d3.extent(data.map(F('date'))); // dateの最小値、最大値
  var upMax = d3.max(data.map(F('up_size'))); // upload回数の最大値

  var x = d3.time.scale()
    .domain(dateExtent)
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, upMax])
    .range([height, 0]);

  var line = d3.svg.line()
    .interpolate('basis')
    .x(F('date', x))
    .y(F('up_size', y));

  var svg = d3.select('#realtime')
    .append('svg')
    .attr({
      'width': width + margin.left + margin.right,
      'height': height + margin.top + margin.bottom
    })
    .style('margin-left', -margin.left + 'px')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
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
    .call(x.axis = d3.svg.axis().scale(x).orient('bottom'));

  var path = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .append('path')
    .data(up_sizes)
    .attr('class', 'line');

  svg.select('.line')
      .attr({
        'd': line,
        'transform': null
      });

  //tick();

  //function tick() {
  //  // update the domains

  //}
});
