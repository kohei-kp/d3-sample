// width height
var map_w = 550,
    map_h = 600,
    bar_w = 600,
    bar_h = 300,

//sort flg
    sort_flg = false,

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
d3.json('./japan.topojson', function(data){
  // features
  var features = topojson.feature(data, data.objects.japan).features;
  // create map
  map_svg.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    //.datum(features)
    .attr({
      'stroke': 'black',
      'stroke-width': '0.5',
      'd': path,
      'class': function(d, i){
        return 'state' + i;
      },
      'fill': '#669966'
    })
    .on('mouseover', function(){
      d3.select(this)
        .attr('fill', 'red');
    })
    .on('mouseout', function(){
      d3.select(this)
        .attr('fill', '#669966');
    });

  // csv
  d3.csv('./Population.csv', function(data){
    var i = 0,
        len = data.length,
        xScale,
        yScale,
        p_array = [],
        switchSort = function(){
          // switching flg
          sort_flg = !sort_flg;

          bar_svg.selectAll('rect')
            .sort(function(a, b){
              if(sort_flg){
                // Asc
                return d3.ascending(a, b);
              }else{
                // Desc
                return d3.descending(a, b);
              }
            })
            .transition()
            .delay(function(d, i){
              return i * 30;
            })
            .duration(900)
            .attr({
              'x': function(d, i){
                return xScale(i);
              }
            });
        }

    for(i = 0; i < len; i += 1){
      p_array.push(parseInt(data[i].Population));
    }

    xScale = d3.scale.ordinal()
      .domain(d3.range(len))
      .rangeRoundBands([0, bar_w], 0.07);

    yScale = d3.scale.linear()
      .domain([0, d3.max(p_array)])
      .range([0, bar_h]);

    //var circle = map_svg.selectAll('circle').data(data);
    //circle.enter().insert('path')
    //  .attr({
    //    'd': path
    //  })
    //  .on('mouseover', function(){
    //    console.log('mouse');
    //  });
    map_svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr({
        'cx': function(d){
          return projection([d.Lon, d.Lat])[0];
        },
        'cy': function(d){
          return projection([d.Lon, d.Lat])[1];
        },
        'r': function(d){
          return Math.sqrt(parseInt(d.Population) * 0.00004);
        }
      })
      .style({
        'fill': 'orange',
        'opacity': 0.5
      });

    
    bar_svg.selectAll('rect')
      .data(p_array)
      .enter()
      .append('rect')
      .attr({
        'x': function(d, i){
          return xScale(i);
        },
        'y': function(d){
          return bar_h - yScale(d);
        },
        'width': xScale.rangeBand(),
        'height': function(d){
          return yScale(d);
        },
        'fill': function(d){
          return 'rgb(0, 50, 100)';
        }
      })
      .on('click', function(){
        switchSort();
      });
  });
});

//test
