//reusable linechart 

'use strict'

if(!ft){
	var ft = {};
}

if(!ft.charts){
	ft.charts = {};
}

ft.charts.lineChart = function(p){ 

	var lineClasses = ['series1','series2','series3','series4','series5','series6','series7','accent'],
	complementaryLineCLasses = ['forecast']; //these classes can be used in addition to those above

	function buildModel(opts){
		var m = {
			//layout stuff
			height:undefined,
			width:300,
			blockPadding:8,
			//data stuff
			indexProperty:'&',
			dateParser:d3.time.format('%d %b %Y').parse,
			falseorigin:false, //TODO, find out if there's a standard 'pipeline' temr for this
			error:{},
			lineClasses:{}
		};

		for(var key in opts){
			m[key] = opts[key];
		}

		m.chartLines = m.headings.filter(function(d){
			return (d != m.indexProperty);
		});

		if(m.chartLines.length == 1 && m.key == undefined){
			m.key = false;	//if there's only one line then default to no key
		}else if(m.key == undefined){
			m.key = true;
		}

		m.data = m.data.map(function(d){
			var s = d[m.indexProperty];
			d[m.indexProperty] = m.dateParser( s );
			if(d[m.indexProperty] === null){
				if(!m.error.dateparser) m.error.dateparser = [];
				m.error.dateparser.push('unable to parse date "' + s + '"')
			}
			return d;
		});

		//make sure all the lines are numerical values, calculate extents... 
		//(by convention each non index property of the data is going to be a line)
		var extents = [];
		m.chartLines.forEach(function(l, i){
			m.lineClasses[l] = lineClasses[i];
			m.data = m.data.map(function(d){
				//TODO, check for non numerical values
				var v = parseFloat(d[l]);
				if(isNaN(v)){
					d[l] = undefined;
				}else{
					d[l] = v;	
				}
				return d;
			});
			var ext = d3.extent(m.data, function(d){
				return d[l];
			});
			extents = extents.concat (ext);
		});

		//work out the time domain
		m.timeDomain = d3.extent(m.data, function(d){
			return d[m.indexProperty];
		});

		//work out the value domain		
		m.valueDomain = d3.extent( extents );

		if(!m.falseorigin && m.valueDomain[0] > 0){ // unless a false origin has been specified
			m.valueDomain[0] = 0;
		}

		return m;
	}
	


	function chart(g){
		console.log('linechart called');

		var model = buildModel( g.data()[0] );
		var svg = g.append('svg')
			.attr({
				'class':'line-chart',
				'height':model.height,	//we don't necessarily know the height at the moment so may be undefiend...
				'width':model.width
			});	

		//create title, subtitle, key, source, footnotes, logo, the chart itself
		var wrappedText = ft.charts.textArea().width( model.width );
		var chartKey = ft.charts.lineKey()
			.style(function(d){
				return d.value;
			})
			.label(function(d){
				return d.key;
			});
			
		var title = svg.append('g').attr('class','chart-title').datum( model.title ).call( wrappedText );
		var subtitle = svg.append('g').attr('class','chart-subtitle').datum( model.subtitle ).call( wrappedText );
		var source = svg.append('g').attr('class','chart-source').datum( 'Source: ' + model.source ).call( wrappedText );

		var key = svg.append('g').attr('class','chart-key').datum( d3.entries(model.lineClasses) ).call(chartKey);



		console.log(model);



		// element positioning / repositioning 


	}


	chart.errors = function(){
		return {};
	}

	console.log('LC');

	return chart;
}