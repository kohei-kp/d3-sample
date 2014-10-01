var util = new LOG_VISUALIZE.Util(),
    db = new LOG_VISUALIZE.DatabaseAccess(),
    //upsize = db.getCountUpSize(),
    //login = db.getHourLogin(),
    //datas = [],
    map, projection;

// 週間ログイン バブルチャート
createPunchCard();

// 地図の描画
createJapanMap();

// 面グラフ
createAreaGraph();

// リアルタイムチャート
createRealTimeChart();

createBarLine();

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

  // svg
  var svg = util.createSVG('#login', width, height);

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

  day.selectAll('line').data(days).enter().append('line')
    .attr({
      'x1': 0,
      'x2': width,
      'y1': function (d) {
        return y.step * (days.indexOf(d) + 1) + 15;
      },
      'y2': function (d) {
        return y.step * (days.indexOf(d) + 1) + 15;
      },
      'fill': 'none',
      'stroke': '#CBCBCB'
    });

  // yAxis
  hourTxt = hour.selectAll('text').data(hours).enter().append('text');
  hourTxt.attr({
    'x': function (d) {
      return x.step * (hours.indexOf(d) + 1) + 40;
    },
    'y': y.max + 30
  })
  .text(function (d) { return d; })
  .attr({
    'font-family': 'sans-serif',
    'font-size': '12px'
  });

  hour.selectAll('line').data(hours).enter().append('line')
    .attr({
      'x1': function (d) {
        return x.step * (hours.indexOf(d) + 2) + 20;
      },
      'x2': function (d) {
        return x.step * (hours.indexOf(d) + 2) + 20;
      },
      'y1': 20,
      'y2': height - 15,
      'fill': 'none',
      'stroke': '#CBCBCB',
      'stroke-width': 0.5
    });

  // ログインリストの取得
  db.getLoginList().done(function (data) {
    var dataset = data.weeklogin, 
        scaleData = [];

    var domain, z, cx, cy, r, title;

    // 型変換
    dataset.forEach(function (d, i) {
      dataset[i] = [parseInt(d.DAY_COUNT), parseInt(d.COUNT), parseInt(d.HOUR)];
      scaleData[i] = parseInt(d.COUNT);
    });

    domain = d3.extent(scaleData);

    z = d3.scale.linear().domain(domain).range([4, 15]);

    circle.selectAll('circle').data(dataset).enter().append('circle')
      .attr({
        cx: 0,
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
          'fill': '#444444',
          stroke: '#999999'
        })
        .transition()
        .duration(300)
        .attr({
          id: 'tooltip-rect',
          x: xPos, y: yPos, rx: 6, ry: 6,
          width: 90, height: 25,
          stroke: '#C3C3C3', 'stroke-width': 1
        });

      svg.append('text')
        .attr('fill', 'white')
        .transition()
        .duration(300)
        .attr({
          id: 'tooltip',
          x: xPos + 47,
          y: yPos + 16,
          'text-anchor': 'middle',
          'font-family': 'sans-serif',
          'font-size': '11px',
          'font-weight': 'bold'
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
      cx: function (d) {
        return x.step * (d[2] + 1) + 50;
      },
      r: function (d) {
        return z(d[1]);
      }
    });
  });
}

// 日本地図の描画
function createJapanMap() {
  d3.json('../json/japan.topojson', function (d) {
    var width = 650, height = 650, path,
        features = topojson.feature(d, d.objects.japan).features;

    projection = d3.geo.mercator()
      .center([139.5, 35.7])
      .translate([width / 2, height / 2])
      .scale([1400]),
    path = d3.geo.path().projection(projection),

    map = util.createSVG('#map', width, height);

    // 地図の描画
    map.selectAll('path').data(features).enter()
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

// 位置情報描画
function drawLocation() {
  var circle;

  db.getLocationList().done(function (data) {
    var dataset = data.location;

    circle = map.selectAll('circle').data(dataset).enter().append('circle')
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

// エリアチャートの描画
function createAreaGraph() {
  db.getArea().done(function (data) {
    
    // 変数定義
    var parseDate = d3.time.format('%Y-%m-%d').parse,
        // データの最大値、最小値
        dateExtent, countMax,

        // 上位グラフ用
        margin = { top: 10, right: 10, bottom: 100, left: 40 },
        w = 800 - margin.left - margin.right,
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
        area, area2, focus, context, brush,
        
        dataset = data.area;

        // データの型変換
        dataset.forEach(function (d) {
          d.date = parseDate(d.date);
          d.count = parseInt(d.count);
          d.up_size = parseInt(d.up_size) / 1000000;
        });

      dateExtent = d3.extent(dataset.map(F('date'))); // dateの最小値、最大値
      countMax = d3.max(dataset.map(F('up_size'))); // upload回数の最大値

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
        .y1(F('up_size', yScale));

      // 下位グラフarea
      area2 = d3.svg.area()
        .interpolate('monotone')
        .x(F('date', x2Scale))
        .y0(h2)
        .y1(F('up_size', y2Scale));

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
        .datum(dataset)
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
      context.append('path').datum(dataset).attr('d', area2);

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
}

/**-----------------------------------------
 * realTIme test
 * -----------------------------------------*/
function createRealTimeChart() {
  var n = 243, duration = 750,

      // 時間
      now = new Date(Date.now() - duration),
      data = d3.range(n).map(function () { return 0; }),

      // SVG
      margin = { top: 6, right: 10, bottom: 20, left: 0 },
      width = 960 - margin.right,
      height = 300 - margin.top - margin.bottom,
      svg,

      // Scale
      x = d3.time.scale()
        .domain([now - (n - 2) * duration, now - duration])
        .range([0, width]),

      y = d3.scale.linear()
        .range([height, 0]),

      line, axis, path;

  // createSVG
  svg = util.createSVG('#realtime',
    width + margin.left + margin.right,
    height + margin.top + margin.bottom
  );
  svg.style('margin-left', -margin.left + 'px')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('defs').append('clipPath')
    .attr('id', 'clip')
    .append('rect')
    .attr({
      width: width,
      height: height
    });

  // line
  line = d3.svg.line()
    .interpolate('basis')
    .x(function (d, i) { return x(now - (n - 1 - i) * duration); })
    .y(function (d, i) { return y(d); });

  // axis
  axis = svg.append('g')
    .attr({
      class: 'x axis',
      transform: 'translate(0,' + height + ')'
    })
    .call(x.axis = d3.svg.axis().scale(x).orient('bottom'));

  path = svg.append('g')
    .attr('clip-path', 'url(#clip)')
    .append('path')
    .data([data])
    .attr('class', 'line');

  tick();

  function tick() {
    // update the domains
    now = new Date();
    x.domain([now - (n - 2) * duration, now - duration]);
    y.domain([0, d3.max(data)]);

    // path
    data.push(Math.random() * 2000000);

    svg.select('.line')
      .attr({
        d: line,
        transform: null
      });

    // slide x-axis
    axis.transition()
      .duration(duration)
      .ease('linear')
      .call(x.axis);

    // slide line
    path.transition()
      .duration(duration)
      .ease('linear')
      .attr('transform', 'translate(' + x(now - (n - 1) * duration) + ')')
      .each('end', tick);

    // shift
    data.shift();
  }
}

/**--------------------------------------*
 * Bar Line Chart
 *---------------------------------------*/
function createBarLine() {
 var margin = { top: 30, right: 20, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
 

      svg, bar, line, 

      // 軸
      xAxis, yAxis, yAxis2,

      // スケール
      xScale, yScale, y2Scale,

      parseDate = d3.time.format('%Y-%m-%d').parse;

  // svg生成
  svg = util.createSVG('#bar-line',
    width + margin.left + margin.right,
    height + margin.top + margin.bottom
  );

  svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');

  // データ取得
  db.getArea().done(function (data) {
    var dataset = data.area, line;

    dataset.forEach(function (d) {
      d.date = parseDate(d.date);
      d.count = parseInt(d.count);
      d.up_size = parseInt(d.up_size) / 1000000;
    });
 
    xScale = d3.time.scale()
      .range([0, width]);

    yScale = d3.scale.linear()
      .range([height, 5]);

    y2Scale = d3.scale.linear()
      .range([height, 5]);

    xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom');

    yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('right');

    y2Axis = d3.svg.axis()
      .scale(y2Scale)
      .orient('right');

    line = d3.svg.line()
      .x(function (d) { return xScale(d.date); })
      .y(function (d) { return yScale(d.count); });

    xScale.domain(d3.extent(dataset.map(F('date'))));
    yScale.domain(d3.extent(dataset.map(F('count'))));
    y2Scale.domain([0, d3.max(dataset.map(F('up_size')))]);

    svg.append('g')
      .attr({
        class: 'x axis',
        transform: 'translate(0,' + height + ')'
      })
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + width + ', 0)')
      .call(yAxis)
      .append('text')
      .attr({
        transform: 'translate(-20,' + 20 + ') rotate(-90)',
        y: 6,
        dy: '.71em'
      })
      .style('text-anchor', 'end')
      .text('Upload Count');

    svg.append('g')
      .attr('class', 'y axis')
      .call(y2Axis)
      .append('text')
      .attr({
        transform: 'translate(50, 20) rotate(-90)',
        y: 6,
        dy: '.71em'
      })
      .style('text-anchor', 'end')
      .text('Upload Size /MB');


    // draw graph
    svg.selectAll('.bar').data(dataset).enter()
      .append('rect')
      .attr({
        class: 'bar',
        id: function (d) { return d.up_size },
        x: function (d) { return xScale(d.date); },
        width: 10,
        y: function (d) { return y2Scale(d.up_size); },
        height: function (d) { return height - y2Scale(d.up_size); },
        fill: '#CCF',
        'stroke': 'white',
        'stroke-width' : 1
      })
     .on('mouseover', function (d) {
        d3.select(this).attr('fill', '#B0B0FF');

        var xPos = parseFloat(d3.select(this).attr('x')),
            yPos = parseFloat(d3.select(this).attr('y'))

        svg.append('text')
          .attr('fill', 'black')
          .transition()
          .duration(300)
          .attr({
            id: 'tooltip',
            x: xPos,
            y: yPos + 20,
            'text-anchor': 'middle',
            'font-family': 'sans-serif',
            'font-size': '11px',
            'font-weight': 'bold'
          })
          .text(d3.select(this).attr('id') + ' MB');
    })
    .on('mouseout', function () {
      d3.select(this).attr('fill', '#CCF');
      d3.select('#tooltip').remove();
    });

    svg.append('path')
      .datum(dataset)
      .attr({
        class: 'line',
        d: line
      });
   });
}
