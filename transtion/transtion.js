var w = 500, h = 500;

// svg
var svg = d3.select('body').append('svg')
      .attr({ width: w, height: h });
// circle
var circle;

// color
var colors = d3.scale.category10().range();

var ms = 1000;

var add = function () {
  var i = Math.floor(Math.random() * 11);
      circle = svg.append('circle')
        .attr({ cx: 50, cy: 100, r: 20, fill: colors[i]});
};

var move = function() {
  add();
  // transtion 1
  circle.transition()
    .duration(ms)
    .attr('cy', 50)
    .transition()
    .duration(ms)
    .attr('cx', 100)
    .transition()
    .duration(ms)
    .attr('cy', 100)
  // transtion 2
    .transition()
    .duration(ms)
    .attr({cx: 250, cy: 250})
    .transition()
    .duration(ms)
    .attr('cx', 300)
    .transition()
    .duration(ms)
    .attr('cy', 300)
    .transition()
    .duration(ms)
    .attr('cx', 250)
  // transtion 3
    .transition()
    .duration(ms)
    .attr({cx: 100, cy: 300})
    .transition()
    .duration(ms)
    .attr('cx', 50)
    .transition()
    .duration(ms)
    .attr('cy', 250)
    .transition()
    .duration(ms)
    .attr('cx', 100)
  // transtion 4
    .transition()
    .duration(ms)
    .attr({cx: 300, cy: 100})
    .transition()
    .duration(ms)
    .attr('cy', 50)
    .transition()
    .duration(ms)
    .attr('cx', 250)
    .transition()
    .duration(ms)
    .attr('cy', 100)
  // transtion5
    .transition()
    .duration(ms)
    .ease('back')
    .attr({cx: 175, cy: 175})
    .transition()
    .duration(ms)
    .attr({r: 100, opacity: 0.5})
    .each('end', function () {
      d3.select(this).remove();
    });
};

setInterval(move, 1000);
