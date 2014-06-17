// width height
var map_w = 550,
    map_h = 600,
    bar_w = 600,
    bar_h = 300,

//sort flg
    sort_flg = false,

// scale
    xScale,
    yScale,

// projection
    projection = d3.geo.mercator()
      .center([139.5, 35.7])
      .translate([map_w / 2, map_h / 2])
      .scale([1200]),

// path generator
    path = d3.geo.path()
      .projection(projection),

// svg
    map_svg = d3.select('body')
      .append('svg')
      .attr({
        'width': map_w,
        'height': map_h
      }),

// var_svg
    bar_svg = d3.select('body')
      .append('svg')
      .attr({
        'width': bar_w,
        'height': bar_h
      })
      .style({
        'margin-bottom': '200px'
      });

// json
d3.json('../json/japan.topojson', function (data) {
  // features
  var features = topojson.feature(data, data.objects.japan).features;
  // create map
  map_svg.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr({
      'stroke': 'black',
      'stroke-width': '0.5',
      'd': path,
      'class': function (d, i) {
        return d.properties.name;
      },
      'fill': '#669966'
    });

  // csv
  d3.csv('../Population.csv', function (data) {
    var i = 0,
        len = data.length,
        p_obj = {},
        ary1 = [],
        ary2 = [],
        switchSort = function () {
          // switching flg
          sort_flg = !sort_flg;

          bar_svg.selectAll('rect')
            .sort(function (a, b) {
              if (sort_flg) {
                // Asc
                return d3.ascending(a, b);
              } else {
                // Desc
                return d3.descending(a, b);
              }
            })
            .transition()
            .delay(function (d, i) {
              return i * 30;
            })
            .duration(900)
            .attr({
              'x': function (d, i) {
                return xScale(i);
              }
            });
        }

    for (i = 0; i < len; i += 1) {
      ary1.push(parseInt(data[i].Population));
      ary2.push(data[i].StateEn);
    }
    p_obj.Population = ary1;
    p_obj.State_en = ary2;

    map_svg.selectAll('path')
      .on('mouseover', function (d) {
        var state_local = d.properties.name_local,
            state = d.properties.name,
            len = data.length,
            circle_data,
            i;

        i = len;
        while (i--) {
          if (state_local === data[i].State) {
            circle_data = data[i];
            break;
          }
        }
        map_svg.insert('circle', 'map_svg')
          .attr({
            'cx': projection([circle_data.Lon, circle_data.Lat])[0],
            'cy': projection([circle_data.Lon, circle_data.Lat])[1],
            'r': Math.sqrt(parseInt(circle_data.Population) * 0.00004),
            'class': state,
            'fill': 'red',
            'opacity': 0.7,
          })
          .transition()
          .delay(100)
          .duration(900)
          .attr({
            'fill': 'orange',
            'opacity': 0.7
          });

        bar_svg.select('.' + d.properties.name + '_bar')
          .attr({
            'fill': 'orange'
          });
      })
      .on('mouseout', function (d) {
        map_svg.selectAll('circle')
          .node()
          .remove();

        if (d.properties.name === 'Hyōgo') {
          d.properties.name = 'Hyogo';
        }
        bar_svg.select('.' + d.properties.name + '_bar')
          .attr({
            'fill': 'rgb(0, 50, 100)'
          });
      });

    xScale = d3.scale.ordinal()
      .domain(d3.range(len))
      .rangeRoundBands([0, bar_w], 0.07);

    yScale = d3.scale.linear()
      .domain([0, d3.max(p_obj.Population)])
      .range([0, bar_h]);

    bar_svg.selectAll('rect')
      .data(p_obj.Population)
      .enter()
      .append('rect')
      .attr({
        'x': function (d, i) {
          return xScale(i);
        },
        'y': function (d) {
          return bar_h - yScale(d);
        },
        'width': xScale.rangeBand(),
        'height': function (d) {
          return yScale(d);
        },
        'fill': function (d) {
          return 'rgb(0, 50, 100)';
        },
        'class': function (d, i) {
          return p_obj.State_en[i] + '_bar';
        }
      })
      .on('click', function () {
        switchSort();
      });
  });
});

var shuffle = function () {
  bar_svg.selectAll('rect')
    .sort(function (d) {
      return d3.shuffle(d);
    })
    .transition()
    .delay(function(d, i){
      return i * 30;
    })
    .duration(900)
    .attr({
      'x': function (d, i) {
        return xScale(i);
      }
    });
};
