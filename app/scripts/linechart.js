function lineChart(config, parentselector){
	console.log('drawing a chart');
	var chart = {
		height:400,
		width:400,
		margin:{top:20,left:20,bottom:40,right:20},
		indexProperty:'&',
		dateParser:d3.time.format('%d %b %Y').parse,
		falseorigin:false, //TODO, find out if there's a standard 'pipeline' temr for this
		error:{}
	}, 
	chartLines, timeDomain, extents, valueDomain, svg, timeScale, valueScale, valueAxis, timeAxis, lines;

	for(var key in config){
		chart[key] = config[key];
	}

	chartLines = chart.headings.filter(function(d){
		return (d != chart.indexProperty);
	})

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
	chartLines.forEach(function(l){
		chart.data = chart.data.map(function(d){
			//TODO, check for non numerical values
			//TODO, check for integers
			d[l] = parseFloat(d[l]);
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
	chart.displayHeight = chart.height - (chart.margin.top + chart.margin.bottom)
	
	timeScale = d3.time.scale()
		.range( [0, chart.displayWidth] )
		.domain( timeDomain );

	valueScale = d3.scale.linear()
		.range( [0,  chart.displayHeight] )
		.domain( valueDomain.reverse() );

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
	}).append('g').attr('transform','translate(' + chart.margin.left + ',' + chart.margin.top + ')');

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
	
			lines.append("path")
				.datum( chart.data )
				.attr( "class", "line" )
				.attr( "d", line );
		}
	})

	
	

	//add the title and sub title

	//add the source

	//add the FT logo

	//if there are no errors attach saving controls
	return chart;
}