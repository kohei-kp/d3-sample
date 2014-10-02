// realtime Chart
(function () {
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
}());
