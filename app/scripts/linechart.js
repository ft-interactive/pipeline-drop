function lineChart(config, parentselector){
	console.log('drawing a chart');
	var chart = {
		//layout stuff
		height:undefined,
		width:300,
		plotHeight:300,
		plotWidth: 250,
		keyDashLength:15,
		blockPadding:8,
		
		//data stuff
		indexProperty:'&',
		dateParser:d3.time.format('%d %b %Y').parse,
		falseorigin:false, //TODO, find out if there's a standard 'pipeline' temr for this

		error:{},
		lineClasses:{}
	},
	lineClasses = ['series1','series2','series3','series4','series5','series6','series7','accent'],
	complementaryLineCLasses = ['forecast'], //these classes can be used in addition to those above
	keyLineHeight = 15,
	chartLines, timeDomain, extents, valueDomain, timeScale, valueScale, 
	//chart elements
	root,
	titleBlock,
	subtitleBlock,
	plotBlock,
	keyBlock,
	footnotesBlock,
	sourceBlock,

	svg, valueAxis, timeAxis, lines, footer, calculatedKeyHeight;

	function translate(position){
		var y, x;
		position.top ? y = position.top : y = 0;
		position.left ? x = position.left : x = 0;
		return 'translate(' + x + ',' + y + ')';
	}

	for(var key in config){
		chart[key] = config[key];
	}

	chartLines = chart.headings.filter(function(d){
		return (d != chart.indexProperty);
	});

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
	});

	//work out the time domain
	timeDomain = d3.extent(chart.data, function(d){
		return d[chart.indexProperty];
	});

	//work out the value domain
	//by convention each non index property of the data is going to be a line
	extents = [];
	chartLines.forEach(function(l){
		var ext = d3.extent(chart.data, function(d){
			return d[l];
		});
		extents = extents.concat (ext);
	});
	valueDomain = d3.extent( extents );

	if(!chart.falseorigin && valueDomain[0] > 0){ // unless a false origin has been specified
		valueDomain[0] = 0;
	}


//work out all the positions in a simple stack layout, the default... 
	var stackPosition = 0;
	var textArea = ft.charts.textArea().width(chart.width);
	//add the heading, sub heading, source, footnotes,
	root = d3.select(parentselector).append('svg');

	if(chart.title){
		titleBlock = root.append('g').attr('class','chart-title')
			.datum(chart.title).call(textArea);
		
		var b = titleBlock.node()
			.getBoundingClientRect();

		if(!chart.titlePosition){ 
			chart.titlePosition = {top:stackPosition + Math.ceil(b.height), left:0};
			stackPosition += Math.ceil(b.height) + chart.blockPadding;
		}
	}

	if(chart.subtitle){
		subtitleBlock = root.append('g').attr('class','chart-subtitle')
			.datum(chart.subtitle).call(textArea);
		
		b = subtitleBlock.node()
			.getBoundingClientRect();
		
		if(!chart.subtitlePosition){
			chart.subtitlePosition = {top:stackPosition + Math.ceil(b.height), left:0};
			stackPosition += Math.ceil(b.height) + chart.blockPadding;
		}
	}

	
	//repositon everything
	subtitleBlock ? subtitleBlock.attr('transform', translate(chart.subtitlePosition)): false;
	titleBlock ? titleBlock.attr('transform', translate(chart.titlePosition)): false;

//
/*	var stack = {}; //this object is used for positioning stuff
	if(chart.title){
		chart.titleposition = {top:stackPosition, left:0};
		stackPosition += 30;
	}
	if(chart.subtitle){
		chart.subposition = {top:stackPosition, left:0};
		stackPosition += 30;
	}
	if(chartLines.length > 1){
		calculatedKeyHeight = keyLineHeight * chartLines.length;
		chart.keyposition = {top:stackPosition, left:0};
		stackPosition += calculatedKeyHeight;
	}
	chart.chartposition = {top:stackPosition, left:30};
	stackPosition += chart.plotHeight;
	if(chart.source){
		stackPosition += 50;
		chart.footnoteposition = {top:stackPosition, left:0};
	}
	stackPosition += 50; */




	
	//create the scale
	
	timeScale = d3.time.scale()
		.range( [0, chart.plotWidth] )
		.domain( timeDomain );

	valueScale = d3.scale.linear()
		.range( [0,  chart.plotHeight] )
		.domain( valueDomain.reverse() )
		.nice();

	//create the axes 
	valueAxis = ft.charts.valueAxis()
		.tickSize( chart.plotWidth )	//make the ticks the width of the chart
		.scale( valueScale );

	timeAxis = ft.charts.dateAxis()
		.yOffset( chart.plotHeight )	//position the axis at the bottom of the chart
		.scale( timeScale ),

	//set up the SVG
	svg = d3.select(parentselector).insert('svg').attr({
		width:chart.width,
		height:stackPosition
	}).append('g').attr('transform',translate(chart.chartposition));

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
				.attr( 'class', 'line ' + chart.lineClasses[h] )
				.attr( 'd', line );
		}
	})

	

	//chart annotations etc...
	chart.root = d3.select(parentselector).select('svg');
	//add the title and sub title

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
	d3.xml('images/ft-square.svg', "image/svg+xml", function(xml){
		var importedNode = document.importNode(xml.documentElement, true).getElementsByTagName("g")[0];
		chart.root.node().appendChild(importedNode);
		chart.root.select('.ft-logo').attr({
			transform:'translate(' + (chart.width - 32) + ',' + (stackPosition-32) + ') scale(0.125, 0.125)'
		})
	})


	return chart;
}