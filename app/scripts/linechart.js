function lineChart(config, parentselector){
	console.log('drawing a chart');
	var chart = {
		height:400,
		width:300,
		margin:{top:100,left:20,bottom:70,right:20},
		titleposition:{top:30,left:0},
		subposition:{top:55,left:0},
		footnoteposition:{bottom:20, left:0},
		keyposition:{top:20, left:0},
		indexProperty:'&',
		dateParser:d3.time.format('%d %b %Y').parse,
		falseorigin:false, //TODO, find out if there's a standard 'pipeline' temr for this
		error:{},
		lineClasses:{},
		keyDashLength:15
	},
	lineClasses = ['series1','series2','series3','series4','series5','series6','series7','accent'],
	complementaryLineCLasses = ['forecast'], //these classes can be used in addition to those above
	keyLineHeight = 15,
	chartLines, timeDomain, extents, valueDomain, svg, timeScale, valueScale, valueAxis, timeAxis, lines, footer, calculatedKeyHeight;

	function translate(position){
		var y = 0, x = 0;

		if(position.top){
			y = position.top;
		}else if(position.bottom){
			y = chart.height - position.bottom;
		}

		if(position.left){
			x = position.left;
		}else if(position.right){
			x = chart.width - position.right;
		}

		return 'translate(' + x + ',' + y + ')';
	}

	for(var key in config){
		chart[key] = config[key];
	}

	chartLines = chart.headings.filter(function(d){
		return (d != chart.indexProperty);
	});

//work out all the positions in a simple stack layout... 
	var stackPosition = 0;
	var stack = {}
	if(chart.title){
		stackPosition += 30;
		stack.titleposition = stackPosition;
	}
	if(chart.subtitle){
		stackPosition += 30;
		stack.titleposition = stackPosition;
	}
	if(chartLines.length > 1){
		calculatedKeyHeight = keyLineHeight * chartLines.length;
		stackPosition += calculatedKeyHeight
	}


	//sort out the dates

	chart.data = chart.data.map(function(d){
		var s = d[chart.indexProperty];
		d[chart.indexProperty] = chart.dateParser( s );
		if(d[chart.indexProperty] === null){
			if(!chart.error.dateparser) chart.error.dateparser = [];
			chart.error.dateparser.push('unable to parse date "' + s + '"')
		}
		return d;
	});

	//make sure all the lines are numerical values...
	chartLines.forEach(function(l, i){
		chart.lineClasses[l] = lineClasses[i];
		chart.data = chart.data.map(function(d){
			//TODO, check for non numerical values
			var v = parseFloat(d[l]);
			if(isNaN(v)){
				d[l] = undefined;
			}else{
				d[l] = v;	
			}
			return d;
		})
	})

	//work out the time domain
	timeDomain = d3.extent(chart.data, function(d){
		return d[chart.indexProperty];
	});

	//work out the value domain
	//each non index property fo the data is gogin to be a line
	extents = [];
	chartLines.forEach(function(l){
		extents = extents.concat  (d3.extent(chart.data, function(d){
						return d[l];
					}));
	});
	valueDomain = d3.extent( extents );

	if(!chart.falseorigin && valueDomain[0] > 0){ // unless a false origin has been specified
		valueDomain[0] = 0;
	}
	
	//create the scale
	chart.displayWidth = chart.width - (chart.margin.left + chart.margin.right);
	chart.displayHeight = chart.height - (chart.margin.top + chart.margin.bottom);
	
	timeScale = d3.time.scale()
		.range( [0, chart.displayWidth] )
		.domain( timeDomain );

	valueScale = d3.scale.linear()
		.range( [0,  chart.displayHeight] )
		.domain( valueDomain.reverse() )
		.nice();

	//create the axes 
	valueAxis = ft.charts.valueAxis()
		.tickSize( chart.displayWidth )	//make the ticks the width of the chart
		.scale( valueScale );

	timeAxis = ft.charts.dateAxis()
		.yOffset( chart.displayHeight )	//position the axis at the bottom of the chart
		.scale( timeScale ),

	//set up the SVG
	svg = d3.select(parentselector).insert('svg').attr({
		width:chart.width,
		height:chart.height
	}).append('g').attr('transform',translate(chart.margin));

	//add the axes
	svg.call(valueAxis);
	svg.call(timeAxis);

	//draw the line(s)
	lines = svg.append('g').attr('class','line-chart');

	chart.headings.forEach(function(h){
		if(h != chart.indexProperty){
			var line = d3.svg.line()
				.x(function(d) { return timeScale ( d[chart.indexProperty] ); })
				.y(function(d) { return valueScale ( d[h] ); });
	
			lines.append('path')
				.datum( chart.data )
				.attr( 'class', 'line ' + chart.lineClasses[h])
				.attr( 'd', line );
		}
	})

	

	//chart annotations etc...
	chart.root = d3.select(parentselector).select('svg');
	//add the title and sub title

	if(chart.title){
		chart.root.append('text')
			.attr({
				'class':'chart-title',
				'transform':translate(chart.titleposition)
			})
			.text(chart.title);
	}

	if(chart.subtitle){
		chart.root.append('text').attr({
			'class':'chart-subtitle',
			'transform':translate(chart.subposition)
		}).text(chart.subtitle);
	}

	//add the footnote (with a check for 'delete if not required')

	footer = chart.root.append('g')
		.attr({
			'class':'chart-footer',
			'transform':translate(chart.footnoteposition)
		})

	if(chart.footnote){
		footer.append('text').attr({
			'class':'chart-footnote'
		}).text(chart.footnote);
	}
	
	//add the source
	
	if(chart.source){
		//if there's a footnote shift htis down a line
		footer.append('text').attr({
			'class':'chart-source',
			'transform':function(){
				if(chart.footnote){
					return 'translate(0,18)';
				}
			}
		}).text('Source: ' + chart.source);
	}

	//add a key if there's only one line forget about a key
	if(chartLines.length > 1){
		var key = chart.root.append('g')
			.attr({
				'class':'line-chart-key',
				'transform':translate(chart.keyposition)
			})
	
		console.log(window.a = key);
		var keyElements = key.selectAll('g')
				.data(chartLines)
				.enter()
				.append('g')
					.attr({
						'class':'key-element',
						'transform':function(d,i){
							return 'translate(0,' + (keyLineHeight + i * keyLineHeight) + ')'
						}
					});
	
		keyElements.append('text').attr({
			'class':'key-label',
			x:chart.keyDashLength + 3
		}).text(function(d){ return d; });
	
		keyElements.append('line').attr({
			'class':function(d){
				console.log(chart.lineClasses[d]);
				return 'key-line ' + chart.lineClasses[d];
			},
			x1:1,
			y1:-5,
			x2:chart.keyDashLength,
			y2:-5
		});
	}
	//add the FT logo

	return chart;
}