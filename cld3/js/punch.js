// PunchCard Chart
(function () {
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

  var from = '2014/08/20', to = '2014/08/26';

  init();
  drawPunchCard();

  // 初期描画
  function init() {
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
      'y': y.max + 28
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
    drawPunchCard()
  }

  // 描画
  function drawPunchCard() {
    var f = from.replace(/\//g, ''), t = to.replace(/\//g, '');
    // ログインリストの取得
    db.getLoginList(f ,t).done(function (data) {
      var dataset = data,
      //var dataset = data.weeklogin,
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
            return y.step * (d[0] + 1);
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
    function removeCircle() {
      circle.remove();
      circle = svg.append('g');
    }

    d3.select('#backword').on('click', function () {
      var f = new Date(from), t = new Date(to);
      removeCircle();

      from = util.subDate(f);
      to = util.subDate(t);
      
      drawPunchCard();
      d3.select('#term').text(from + '　〜　' + to);
    });

    d3.select('#forword').on('click', function () {
      var f = new Date(from), t = new Date(to);
      removeCircle();

      from = util.addDate(f);
      to = util.addDate(t);

      drawPunchCard();
      d3.select('#term').text(from + '　〜　' + to);
    });
}());
