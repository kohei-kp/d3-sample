var svgWidth = 1000, svgHeight = 500, barWidth = 80, offsetX = 50, offsetY = 30, barMargin = 15;

// svg
var svg = d3.select('#myGraph')
	.append('svg')
	.attr({
		'width' : svgWidth, 
		'height' : svgHeight
	});

// 棒グラフ
var barGraph;

// 折れ線グラフ
var lineGraph;

// X軸、Y軸
var xLine, yLineL, yLineR;

var xLabelList = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// var URL = "./data.json";
var URL = "http://10.211.55.4/wf-log/log/download2";


$(document).ready(function() {
	// X軸ライン
	xLine = svg
		.append("rect")
		.attr({
			'width' : svgWidth - (offsetX * 2),
			'height' : 1,
			'transform' : "translate(" + offsetX + ", "+ (svgHeight - offsetY) + ")"
		});				

	// Y軸ライン(左)
	yLineL = svg
		.append("rect")
		.attr({
			'width' : 1,
			'height' : svgHeight - offsetY,
			'transform' : "translate(" + offsetX + ", " + 0 + ")"
		})
		svg
		.append("text")
		.attr({
			'class' : 'label',
			'x' : 15,
			'y' : offsetY / 2
		})
		.text('サイズ');

	// Y軸ライン（右）
	yLineR = svg
		.append("rect")
		.attr({
			'width' : 1,
			'height' : svgHeight - offsetY,
			'transform' : "translate(" + (svgWidth - offsetX) + ", " + 0 + ")"
		});

		svg
		.append("text")
		.attr({
			'class' : 'label',
			'x' : svgWidth - offsetX + 5,
			'y' : offsetY / 2
		})
		.text('回数');

});

$(function() {

	var ajaxData = function() {
//      	var hostUrl = "http://10.211.55.4/wf-log/log/download3";
		var hostUrl = "./data.json";
		var startDt = $('#startDt').val();
		var endDt   = $('#endDt').val();

		if (startDt.length != 8 ||
		    endDt.length != 8) {
			alert('please input date');
			return 0;
		}
		
		$.ajax({
               		url: hostUrl,
               		type:'GET',
               		dataType: 'json',
			cache: false,
			data: {
				startDt : startDt,
				endDt   : endDt
			},
                	timeout:10000,
                	success: function(data) {
						d3paint(data);
						return data;
        	        },
                	error: function(XMLHttpRequest, textStatus, errorThrown) {
                       	     alert(textStatus);
                       	}
              });

	};

	var d3paint = function(jsonUrl) {
		d3.json(jsonUrl, function (data) {

			d3remove();			

			// X軸の描画位置表示	
			var xPos = function (i) { return i * (barWidth + barMargin) + offsetX;};

			// sizeの最大値
			var maxSize = d3.max(data, function(data) {return data.size;});

			var xScale = d3.scale.linear()
				.domain([1,7])
				.range([offsetX, barWidth - offsetX]);
	
			// size(棒グラフ)用Y軸表示位置計算関数
			var yScaleSize = d3.scale.linear()
				.domain([0, maxSize])
				.range([svgHeight - offsetY, offsetY]);

			var colorSize = d3.scale.linear()
				.domain([0, maxSize])
				.range(["#eeeeff", "#0000ff"]);


			// cntの最大値
			var maxCnt = d3.max(data, function(data) {return data.cnt;});

			// cnt(折れ線グラフ)用Y軸表示位置計算関数
			var yScaleCnt = d3.scale.linear()
				.domain([0, maxCnt])
				.range([svgHeight - offsetY, offsetY]);

			// 棒グラフを初期化
			barGraph = svg
						.selectAll("rect")
						.data(data);

			// 棒グラフの描写
			barGraph
				.enter()
				.append("rect")
				.attr({
					'x' : function(d, i) { return xPos(d.week);},
					'y' : function(d, i) { return svgHeight - offsetY;},
					//'y' : function(d, i) { return yScaleSize(d.size);},	// origin
					'width' : barWidth,
					'height' : 0,
					//'height' : function(d, i) { return svgHeight - yScaleSize(d.size) - offsetY;},	// origin
					'fill' : function(d, i) {return colorSize(d.size);}
				})
				.transition()
				.duration(1000)
				.attr('y', function(d, i) { return yScaleSize(d.size);})
				.attr('height', function(d, i) { return svgHeight - yScaleSize(d.size) - offsetY;});

			// 棒グラフの中に値を表示
			barGraph
				.enter()
				.append("text")
				.transition()
				.delay(1200)
				.attr({
					'class' : 'barNum',
					'x' : function(d, i) { return xPos(d.week) + (barWidth /2);},
					'y' : function(d, i) { return yScaleSize(d.size) - 5;}
				})
				.text(function(d, i) {return d.size;});

			// 折れ線グラフの計算メソッド
			var drawLine = d3.svg.line()
							.x(function(d, i) { return xPos(d.week) + (barWidth / 2); })
							.y(function(d, i) { return yScaleCnt(d.cnt);});

			lineGraph = svg
					.append("path")
					.attr({
						"d" : drawLine(data),
						"fill" : "none",
						"stroke" : "#FF0000"
				});

		    // X軸ライン
		    xLine = svg
    		    .append("rect")
       			 .attr({
        		    'width' : svgWidth - (offsetX * 2),
        		    'height' : 1,
        		    'transform' : "translate(" + offsetX + ", "+ (svgHeight - offsetY) + ")"
       		 });

			// X軸のラベル
			xLine = barGraph
				.enter()
				.append("text")
				.attr({
					'x' : function (d, i) { return xPos(d.week) + (barWidth / 3); },
					'y' : function (d, i) { return svgHeight - offsetY + 15 }
				})
				.text(function(d, i) {return xLabelList[d.week - 1];});

/**
うまくいかないので今回は使わない
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");

			svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(0, " + (svgHeight - offsetY) + ")")
					.call(xAxis);
*/

			// Y軸のラベル（Left:サイズ）
			var yAxisSize = d3.svg.axis()
           		.scale(yScaleSize)
              	.orient("left")
              	.ticks(10);

			 svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + offsetX + ",0)")
					.call(yAxisSize);


			// Y軸のラベル（Right:回数）
			var yAxisCnt = d3.svg.axis()
				.scale(yScaleCnt)
				.orient("right")
				.ticks(10);

			svg.append("g")
					.attr("class", "axis")
					.attr("transform", "translate(" + (svgWidth - offsetX) + ",0)")
					.call(yAxisCnt);

		});
	};

	var d3remove = function() {
		svg.selectAll('rect')
			.transition()
		    .duration(500)
			.attr({
				'y' : svgHeight - offsetY,
				'height' : 0
			})
			.remove();

		svg.selectAll('text')
			.transition()
			.delay(600)
			.remove();
		svg.selectAll('g')
            .transition()
            .delay(600)
			.remove();
		svg.selectAll('path')
            .transition()
            .delay(600)
			.remove();
	} 	

	$('#test').click(function() {
		//ajaxData();
		var data = "./data.json";
		d3paint(data);
	});

	$('#test2').click(function() {
		d3remove();
	});
});


