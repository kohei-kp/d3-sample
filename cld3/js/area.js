// Area Chart
(function () {
  // 上位グラフ用
  var margin = { top: 10, right: 10, bottom: 100, left: 40 },
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
      parseDate = d3.time.format('%Y-%m-%d').parse;

  init();
  drawAreaGraph();

  function init() {
    svg = util.createSVG('#upload',
      w + margin.left + margin.right,
      h + margin.top + margin.bottom 
    );
    svg.attr('class', 'area');
  }

  function drawAreaGraph() {
    db.getLogUploadAll().done(function (data) {
      //var dataset = data.area;
      var dataset = data;
        // データの型変換
        dataset.forEach(function (d) {
          d.date = parseDate(d.date);
          d.count = parseInt(d.count);
          d.up_size = parseInt(d.up_size) / 1000000;
        });

      dateExtent = d3.extent(dataset.map(F('date'))); // dateの最小値、最大値
      countMax = d3.max(dataset.map(F('count'))); // upload回数の最大値

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
    });
  }

  function brushed() {
    xScale.domain(brush.empty() ? x2Scale.domain() : brush.extent());
    focus.select('path').attr('d', area); // 上位グラフUpdate
    focus.select('.x.axis').call(xAxis); // x軸Update
  }

}());
