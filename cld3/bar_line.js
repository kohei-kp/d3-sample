// bar and line chart
(function () {
  var margin = { top: 30, right: 20, bottom: 30, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
 
      svg, bar, line,

      // 軸
      xAxis, yAxis, yAxis2,

      // スケール
      xScale, yScale, y2Scale,

      parseDate = d3.time.format('%Y-%m-%d').parse;

  init();
  draw();

  function init() {
    // svg生成
    svg = util.createSVG('#bar-line',
      width + margin.left + margin.right,
      height + margin.top + margin.bottom
    );

    svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top +')');
  }

  function draw() {
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

      createBar(dataset);
      createLine(dataset);
    });
  }

  function createBar(dataset) {
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
          x: xPos + 47,
          y: yPos + 16,
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
  }

  function createLine(dataset) {
    svg.append('path')
    .datum(dataset)
    .attr({
      class: 'line',
      d: line
    });
  }
}());
