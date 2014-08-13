require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var d3 = require('d3'),

categoryAxis = function(){

	var ticksize = 5,
		a = d3.svg.axis().orient('left').tickSize(ticksize , 0),
		lineHeight = 16,
		userTicks = [],
		yOffset = 0,
		xOffset = 0;
			
	function isVertical(){
		return (a.orient() == 'left' || a.orient() == 'right')
	}

	function axis(g){		
		g = g.append('g').attr('transform','translate('+xOffset+','+yOffset+')');
		g.call(a);
	}

	axis.tickSize = function(x){
		if (!arguments.length) return ticksize;
		a.tickSize(-x);
		return axis;
	}

	axis.ticks = function(x){
		if (!arguments.length) return a.ticks();
		if(x.length>0){
			userTicks = x;	
		}
		return axis;
	}

	axis.orient = function(x){
		if (!arguments.length) return a.orient();
		a.orient(x);
		return axis;
	};

	axis.scale = function(x){
		if (!arguments.length) return a.scale();
		a.scale(x);
		if(userTicks.length > 0){
			a.tickValues( userTicks );
		}else{
			a.ticks( Math.round( (a.scale().range()[1] - a.scale().range()[0])/100 ) );
		}
		return axis;
	};

	axis.yOffset = function(x){
		if (!arguments.length) return yOffset;
		yOffset = x;
		return axis;
	};

	axis.xOffset = function(x){
		if (!arguments.length) return yOffset;
		xOffset = x;
		return axis;
	};

	return axis;
};

module.exports = categoryAxis;
},{"d3":undefined}],2:[function(require,module,exports){
'use strict'

var d3 = require('d3'),

dateAxis = function(){

	var axes = [ d3.svg.axis().orient('bottom') ],
		scale,
		lineheight = 20, 
		ticksize = -5,
		formatter = {},
		simple = false, // a simple axis has only first and last points as ticks, i.e. the scale's domain extent
		units = ['multi'],
		unitOverride = false,
		yOffset = 0,
		xOffset = 0,
		labelWidth, bounds,


	formatter = {
		centuries: function(d,i){
			if(i==0 || d.getYear()%100 == 0){
				return d3.time.format("%Y")(d)
			}
			return d3.time.format("%y")(d);
		},
		decades: function(d,i){
			if(i==0 || d.getYear()%100 == 0){
				return d3.time.format("%Y")(d)
			}
			return d3.time.format("%y")(d);
		}, 
		years: function(d,i){
			if(i==0 || d.getYear()%100 == 0){
				return d3.time.format("%Y")(d)
			}
			return d3.time.format("%y")(d);
		},
		fullyears: function(d,i){
			return d3.time.format("%Y")(d)
		},
		months: function(d,i){
			return d3.time.format("%b")(d);
		},
		weeks: function(d,i){
			return d3.time.format("%e %b")(d);
		},
		days: function(d,i){
			return d3.time.format("%e")(d);
		},
		hours: function(d, i){
			return parseInt(d3.time.format("%H")(d))+":00"
		}
	},

	interval = {
		centuries: d3.time.year,
		decades: d3.time.year, 
		years: d3.time.year,
		fullyears: d3.time.year,
		months: d3.time.month,
		weeks: d3.time.week,
		days: d3.time.day,
		hours: d3.time.hours
	},

	increment = {
		centuries: 100,
		decades: 10,
		years: 1,
		fullyears: 1,
		months: 1,
		weeks: 1,
		days: 1,
		hours: 6	
	};

	function unitGenerator(domain){	//which units are most appropriate
		var u = [];
		var timeDif = domain[1].getTime() - domain[0].getTime();
		var dayLength = 86400000;
		if(timeDif < dayLength*2){
			return ['hours','days','months'];
		}
		if(timeDif < dayLength*365.25){
			return ['months','years'];	
		}
		if(timeDif < dayLength*365.25*3){
			return ['years'];	
		}
		if(timeDif < dayLength*365.25*100){
			return ['decades'];
		}
		if(timeDif < dayLength*365.25*1000){
			return ['centuries'];
		}

		return ['multi'];
	}

	function dateSort(a,b){
		return ( a.getTime() - b.getTime());
	}

	function axis(g){
		
		g = g.append('g').attr('transform','translate('+xOffset+','+yOffset+')');

		g.append('g').attr('class','x axis').each(function(){
			var g = d3.select(this);
			axes.forEach(function(a,i){
				g.append('g')
					.attr('class',function(){
						if(i==0){
							return 'primary';
						}
						return 'secondary';
					})
					.attr('transform','translate(0,' + ((i * lineheight)) + ')')
					.call(a);
			})
			//remove text-anchor attribute from year positions
			var v = g.selectAll('.primary')
				.selectAll('text').attr({
					'x':null,
					'y':null,
					'dy':15
				});
			g.selectAll('*').attr('style',null); //clear the styles D3 sets so everything's coming from the css
		});

		labelWidth = 0;
		g.select('.tick text').each(function(d){ //calculate the widest label
			labelWidth = Math.max( d3.select(this).node().getBoundingClientRect().width, labelWidth );
		});

		bounds = g.node().getBoundingClientRect();
	}

	axis.simple = function(x){
		if (!arguments.length) return simnple;
		simple = x;
		return axis;
	}

	axis.labelWidth = function(){
		// return the width of the widest axis label
		return labelWidth;
	}

	axis.bounds = function(){
		return bounds;
	}


	axis.lineHeight = function(x){
		if (!arguments.length) return lineheight;
		lineheight = x;
		return axis;
	}

	axis.tickSize = function(x){
		if (!arguments.length) return ticksize;
		ticksize = x;
		return axis;
	}


	axis.scale = function(x, u){
		if (!arguments.length) return axes[0].scale();
		if (!u){
			u = unitGenerator( x.domain() );
		}
		scale = x;
		if(!simple){
			scale.nice( (scale.range()[1] - scale.range()[0])/100 );
		}
		//go through the units array

		axes = [];
		for(var i=0;i<u.length;i++){
			if( formatter[u[i]] ){
				if(!simple){
					var customTicks = scale.ticks( interval[ u[i] ], increment[ u[i] ] );
					customTicks.push(scale.domain()[0]);
					if(null){
						customTicks.push(scale.domain()[1]);
					}
					customTicks.sort(dateSort);
				}else{
					customTicks = scale.domain();
				}


				var a = d3.svg.axis()
					.scale( scale )
					.tickValues( customTicks )
					.tickFormat( formatter[ u[i] ] )
					.tickSize(ticksize,0);

				axes.push( a );
			}
		}

		axes.forEach(function(a){
			a.scale(scale)
		})

		return axis;
	};

	axis.yOffset = function(x){
		if (!arguments.length) return yOffset;
		yOffset = x;
		return axis;
	};

	axis.xOffset = function(x){
		if (!arguments.length) return yOffset;
		yOffset = x;
		return axis;
	};


	return axis;
};

module.exports = dateAxis;
},{"d3":undefined}],3:[function(require,module,exports){
//reusable linechart 
'use strict'

var d3 = require('d3'),
	dateAxis = require('./ft-date-axis.js'),
	valueAxis = require('./ft-value-axis.js'),
	textArea = require('./ft-text-area.js'),
	lineKey = require('./ft-line-key.js'),

lineChart = function(p){ 

	var lineClasses = ['series1','series2','series3','series4','series5','series6','series7','accent'],
	complementaryLineCLasses = ['forecast']; //these classes can be used in addition to those above

	function buildModel(opts){
		var m = {
			//layout stuff
			height:undefined,
			width:300,
			chartHeight:300,
			chartWidth:300,
			blockPadding:8,
			simpleDate:false,
			simpleValue:false,
			//data stuff
			indexProperty:'&',
			dateParser:d3.time.format('%d %b %Y').parse,
			falseorigin:false, //TODO, find out if there's a standard 'pipeline' temr for this
			error:function(err){ console.log('ERROR: ', err) },
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
				m.error('unable to parse date "' + s + '"');
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
	
	function getHeight(selection){
		return Math.ceil(selection.node().getBoundingClientRect().height);
	}

	function getWidth(selection){
		return Math.ceil(selection.node().getBoundingClientRect().width);	
	}

	function translate(position){
		return 'translate(' + position.left + ',' + position.top + ')';
	}

	function chart(g){
		console.log('linechart called');

		var model = buildModel( g.data()[0] ),
			svg = g.append('svg')
				.attr({
					'class':'line-chart',
					'height':model.height,	//we don't necessarily know the height at the moment so may be undefiend...
					'width':model.width
				}),	

	//create title, subtitle, key, source, footnotes, logo, the chart itself
			wrappedText = textArea().width( model.width ),
			chartKey = lineKey()
				.style(function(d){
					return d.value;
				})
				.label(function(d){
					return d.key;
				}),

			elementPositions = [],
			totalHeight = 0;
		
	//position stuff
		//start from the top...
		var title = svg.append('g').attr('class','chart-title').datum( model.title ).call( wrappedText );
		if(!model.titlePosition){
			totalHeight += (getHeight(title) + model.blockPadding);
			model.titlePosition = {top:totalHeight,left:0};
		}
		title.attr( 'transform',translate(model.titlePosition) );

		var subtitle = svg.append('g').attr('class','chart-subtitle').datum( model.subtitle ).call( wrappedText );
		if(!model.subtitlePosition){
			totalHeight += (getHeight(subtitle) + model.blockPadding);
			model.subtitlePosition = {top:totalHeight,left:0};
		}
		subtitle.attr('transform',translate(model.subtitlePosition) );

		var keyData = d3.entries( model.lineClasses );
		if(keyData.length > 1){ //only have keys for more than one item
			var key = svg.append('g').attr('class','chart-key').datum( d3.entries(model.lineClasses) ).call(chartKey);

			if(!model.keyPosition){
				model.keyPosition = {top: totalHeight, left:0};	
				totalHeight += (getHeight(key));
			}
			key.attr( 'transform',translate(model.keyPosition) );
		}
		totalHeight += model.blockPadding;

		var chart = svg.append('g').attr('class','chart');

		if(!model.chartPosition){
			model.chartPosition = {top:totalHeight ,left:0};
		}
		chart.attr( 'transform', translate(model.chartPosition) );
		
		//then start from the bottom...		
		var footnotes = svg.append('g').attr('class','chart-footnote').datum( model.footnote ).call( wrappedText );
		var source = svg.append('g').attr('class','chart-source').datum( 'Source: ' + model.source ).call( wrappedText );
		var footnotesHeight = getHeight(footnotes);
		var sourceHeight = getHeight(source);
		totalHeight += ( footnotesHeight + sourceHeight + model.blockPadding);		

		if(!model.height){
			model.height = totalHeight + model.chartHeight;
		}else{
			model.chartHeight = model.height - totalHeight;
			if(model.chartHeight < 0){
				model.error('calculated plot height is less than zero');
			}
		}
		svg.attr('height',model.height);

		footnotes.attr('transform', 'translate(0,' + model.height + ')');
		source.attr('transform', 'translate(0,' + (model.height - footnotesHeight) + ')');


		//the business of the actual chart
		//make provisional scales
		var valueScale = d3.scale.linear()
			.domain( model.valueDomain.reverse() )
			.range( [0, model.chartHeight ] ).nice();

		var timeScale = d3.time.scale()
			.domain( model.timeDomain )
			.range( [0, model.chartWidth] );

		//first pass, create the axis at the entire chartWidth/Height
		var vAxis = valueAxis()
				.simple( model.simpleValue )
				.tickSize( model.chartWidth )	//make the ticks the width of the chart
				.scale( valueScale ),


			timeAxis = dateAxis()
				.simple( model.simpleDate )
				.yOffset( model.chartHeight )	//position the axis at the bottom of the chart
				.scale( timeScale );

			console.log(valueScale.ticks(), valueScale.domain());


		chart.call(vAxis);
		chart.call(timeAxis);

		//measure chart
		var widthDifference = getWidth(chart) - model.chartWidth, //this difference is the ammount of space taken up by axis labels
			heightDifference = getHeight(chart) - model.chartHeight,
			//so we can work out how big the plot should be (the labels will probably stay the same...
			plotWidth = model.chartWidth - widthDifference,
			plotHeight = model.chartHeight - heightDifference,
			newValueRange = [valueScale.range()[0], plotHeight],
			newTimeRange = [timeScale.range()[0], plotWidth];

		valueScale.range(newValueRange);
		timeScale.range(newTimeRange);
		timeAxis.yOffset(plotHeight);
		vAxis.tickSize(plotWidth);

		//replace provisional axes
		chart.selectAll('*').remove();
		chart.call(vAxis);
		chart.call(timeAxis);

		model.chartPosition.left += (getWidth(chart.select('.y.axis')) - plotWidth);
		model.chartPosition.top += (getHeight(chart.select('.y.axis')) - plotHeight);
		chart.attr('transform',translate(model.chartPosition));
		var lines = chart.append('g').attr('class','plot');

		model.headings.forEach(function(h){
			if(h != model.indexProperty){
				var line = d3.svg.line()
					.x(function(d) { return timeScale ( d[model.indexProperty] ); })
					.y(function(d) { return valueScale ( d[h] ); });
		
				lines.append('path')
					.datum( model.data )
					.attr( 'class', 'line ' + model.lineClasses[h] )
					.attr( 'd', line );
			}
		});
	}

	console.log('LC');

	return chart;
};

module.exports = lineChart;
},{"./ft-date-axis.js":2,"./ft-line-key.js":4,"./ft-text-area.js":7,"./ft-value-axis.js":8,"d3":undefined}],4:[function(require,module,exports){
'use strict'

var d3 = require('d3'),

lineKey = function(){
	var width = 300, 
	strokeLength = 15,
	lineHeight = 16,

	style  = function(d){
		return d.style;
	},

	label = function(d){
		return d.label;
	},

	filter = function(){
		return true;
	};

	function key(g){
		console.log('key', g)
		g = g.append('g').attr('class','chart-linekey');
		var keyItems = g.selectAll('g').data( g.datum().filter( filter ) )
				.enter()
				.append('g').attr({
					'class':'key-item',
					'transform':function(d,i){
						return 'translate(0,' + (lineHeight + i * lineHeight) + ')'
					}
				});

		keyItems.append('line').attr({
			'class': style,
			x1: 1,
			y1: -5,
			x2: strokeLength,
			y2: -5
		}).classed('key-line',true);

		keyItems.append('text').attr({
			'class':'key-label',
			x:strokeLength + 10
		}).text(label);

	}

	key.label = function(f){
		if (!arguments.length) return label;
		label = f;
		return key;
	};

	key.style = function(f){
		if (!arguments.length) return style;
		style = f;
		return key;
	};

	key.width = function(x){
		if (!arguments.length) return width;
		width = x;
		return key;
	};

	key.lineHeight = function(x){
		if (!arguments.length) return lineHeight;
		lineHeight = x;
		return key;
	};

	return key;
};

module.exports = lineKey;

},{"d3":undefined}],5:[function(require,module,exports){
'use strict';
var d3 = require('d3');

var nullChart = function(){
	
	function buildModel(opts){
		var m = {
			//layout stuff
			title:'chart title',
			subtitle:'chart subtitle (letters)',
			height:undefined,
			width:300,
			chartHeight:300,
			chartWidth:300,
			blockPadding:8,
			data:[],
			error:function(err){ console.log('ERROR: ', err) },
		};

		for(var key in opts){
			m[key] = opts[key];
		}

		return m;
	}

	function getHeight(selection){
		return Math.ceil(selection.node().getBoundingClientRect().height);
	}

	function getWidth(selection){
		return Math.ceil(selection.node().getBoundingClientRect().width);	
	}

	function translate(position){
		return 'translate(' + position.left + ',' + position.top + ')';
	}


	function chart(g){
		var model = buildModel( g.data()[0] );
		if(!model.height){
			model.height = model.width;
		}
		var	svg = g.append('svg')
				.attr({
					'class':'null-chart',
					'height':model.height,
					'width':model.width
				});

		var title = svg.append('text').text(model.title + " - PLACE HOLDER CHART");
		title.attr('transform',translate( {top:getHeight(title) ,left:0} ))
		var subtitle = svg.append('text').text(model.subtitle);
		subtitle.attr('transform',translate( {top:getHeight(title) + getHeight(subtitle) ,left:0} ))

		svg.selectAll('text').attr({
			fill:'#000',
			stroke:'none'
		});
	}


	return chart;
}

module.exports = nullChart;
},{"d3":undefined}],6:[function(require,module,exports){
'use strict';
var d3 = require('d3');

var pieChart = function(){
	
	function buildModel(opts){
		var m = {
			//layout stuff
			title:'chart title',
			height:undefined,
			width:300,
			chartHeight:300,
			chartWidth:300,
			indexProperty:'&',
			valueProperty:'value',
			blockPadding:8,
			data:[],
			error:function(err){ console.log('ERROR: ', err) },
		};

		for(var key in opts){
			m[key] = opts[key];
		}


		return m;
	}

	function getHeight(selection){
		return Math.ceil(selection.node().getBoundingClientRect().height);
	}

	function getWidth(selection){
		return Math.ceil(selection.node().getBoundingClientRect().width);	
	}

	function translate(position){
		return 'translate(' + position.left + ',' + position.top + ')';
	}


	function chart(g){
		var model = buildModel( g.data()[0] );
		if(!model.height){
			model.height = model.width;
		}
		var	svg = g.append('svg')
				.attr({
					'class':'null-chart',
					'height':model.height,
					'width':model.width
				});

		var title = svg.append('text').text(model.title + " - PLACE HOLDER CHART");
		title.attr('transform',translate( {top:getHeight(title) ,left:0} ));

		var subtitle = svg.append('text').text(model.subtitle);
		subtitle.attr('transform',translate( {top:getHeight(title) + getHeight(subtitle) ,left:0} ));

		var chart = svg.append('g').attr('class','chart');
		if(model.data.length > 3){
			model.error('PIE warning: too many segments!');
		}

		var outerRadius = model.width / 2; 

		chart.selectAll('.slice')
			.data( model.data )
				.enter()
					.append(path);
		
		svg.selectAll('text').attr({
			fill:'#000',
			stroke:'none'
		});
	}


	return chart;
}

module.exports = pieChart;
},{"d3":undefined}],7:[function(require,module,exports){
//text area provides a wrapping text block of a given type

'use strict'

var d3 = require('d3'),

textArea = function(){ 
	var xOffset = 0, 
		yOffset = 0, 
		width=1000, 
		lineHeight = 20, 
		units = 'px', //pixels by default
		bounds;

	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				y = text.attr('y'),
				dy = parseFloat(text.attr('dy'));

			if(isNaN(dy)){ dy = 0 };

			var tspan = text.text(null).append('tspan')
				.attr('x', 0)
				.attr('y', y)
				.attr('dy', dy + units);

			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(' '));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(' '));
					line = [word];
					lineNumber ++;
					var newY = (lineNumber * lineHeight);
					tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('y', + newY + units).text(word);
				}
			}
		});
	}

	function textArea(g, accessor){
		if(!accessor) {
			accessor = function(d){
				return d;
			}
		}
		console.log('text!')
		g = g.append('g').attr('transform','translate(' + xOffset + ',' + yOffset + ')')
		g.append('text').text(accessor).call(wrap, width);
		bounds = g.node().getBoundingClientRect();
	}


	textArea.bounds = function(){
		return bounds;
	}

	textArea.units = function(x){ //px, em, rem
		if (!arguments.length) return units;
		units = x;
		return textArea;
	};	

	textArea.lineHeight = function(x){ //pixels by default
		if (!arguments.length) return lineHeight;
		lineHeight = x;
		return textArea;
	};

	textArea.width = function(x){
		if (!arguments.length) return width;
		width = x;
		return textArea;
	};

	textArea.yOffset = function(x){
		if (!arguments.length) return yOffset;
		yOffset = x;
		return textArea;
	};

	textArea.xOffset = function(x){
		if (!arguments.length) return yOffset;
		yOffset = x;
		return textArea;
	};

	return textArea;
};

module.exports = textArea;
},{"d3":undefined}],8:[function(require,module,exports){
'use strict'

//this is wrapper for d3.svg.axis
//for a standard FT styled value axis
//usually these are vertical

var d3 = require('d3'),

valueAxis = function(){

	var ticksize = 5,
		a = d3.svg.axis().orient('left').tickSize(ticksize , 0),
		lineHeight = 16,
		userTicks = [],
		yOffset = 0,
		xOffset = 0,
		simple = false,
		labelWidth, bounds;
			
	function isVertical(){
		return (a.orient() == 'left' || a.orient() == 'right')
	}

	function axis(g){
		
		g = g.append('g').attr('transform','translate('+xOffset+','+yOffset+')');

		g.append('g')
			.attr('class', function(){
				if(isVertical()){
					return 'y axis';
				}else{
					return 'x axis';
				}
			})
			.append('g')
				.attr('class', 'primary')
				.call(a);

		//if zero is in scale it gets a heavy tick
		//remove text-anchor attribute from year positions
		g.selectAll('*').attr('style',null); //clear the styles D3 sets so everything's coming from the css
		if (isVertical()){
			g.selectAll('text').attr('transform','translate( 0, ' + -(lineHeight/2) + ' )');
			var scale = a.scale();
			if( Math.abs(scale.domain()[0] - scale.domain()[1]) >= scale.domain()[1]){ //if the axis crosses zero
				//add a stronger line
				g.select('.y.axis').append('line').attr('class','origin tick')
					.attr({
						x1:0,
						y1:scale(0),
						x2:-a.tickSize(),
						y2:scale(0)
					});
			}
		}
		labelWidth = 0;
		g.select('.tick text').each(function(d){ //calculate the widest label
			labelWidth = Math.max( d3.select(this).node().getBoundingClientRect().width, labelWidth );
		});

		bounds = g.node().getBoundingClientRect();

	}

	axis.labelWidth = function(){
		// return the width of the widest axis label
		return labelWidth;
	}

	axis.bounds = function(){
		return bounds;
	}

	axis.tickSize = function(x){
		if (!arguments.length) return ticksize;
		a.tickSize(-x);
		return axis;
	}

	axis.ticks = function(x){
		if (!arguments.length) return a.ticks();
		if(x.length>0){
			userTicks = x;	
		}
		return axis;
	}

	axis.orient = function(x){
		if (!arguments.length) return a.orient();
		a.orient(x);
		return axis;
	};

	axis.simple = function(x){
		if (!arguments.length) return simnple;
		simple = x;
		return axis;
	}

	axis.scale = function(x){
		if (!arguments.length) return a.scale();
		a.scale(x);
		if(userTicks.length > 0){
			a.tickValues( userTicks );
		}else{
			var count = Math.round( (a.scale().range()[1] - a.scale().range()[0])/100 );
			if(simple){
				var customTicks = [], r = a.scale().domain();
				if(Math.min(r[0], r[1]) < 0 && Math.max(r[0], r[1]) > 0){
					customTicks.push(0);
				}
			}else{
				customTicks = a.scale().ticks(count);				
			}
			customTicks = customTicks.concat( a.scale().domain() );
			a.tickValues( customTicks );
		}
		return axis;
	};

	axis.yOffset = function(x){
		if (!arguments.length) return yOffset;
		yOffset = x;
		return axis;
	};

	axis.xOffset = function(x){
		if (!arguments.length) return yOffset;
		xOffset = x;
		return axis;
	};

	return axis;
};

module.exports = valueAxis;
},{"d3":undefined}],"modestCharts":[function(require,module,exports){
'use strict';
var modestCharts = {
	dateAxis: require('./ft-date-axis.js'),
	categoryAxis: require('./ft-category-axis.js'),
	lineKey: require('./ft-line-key.js'),
	textArea: require('./ft-text-area.js'),
	valueAxis: require('./ft-value-axis.js'),
	lineChart: require('./ft-line-chart.js'),
	pieChart: require('./ft-pie-chart.js'),
	nullChart: require('./ft-null-chart.js')
};

module.exports = modestCharts;
},{"./ft-category-axis.js":1,"./ft-date-axis.js":2,"./ft-line-chart.js":3,"./ft-line-key.js":4,"./ft-null-chart.js":5,"./ft-pie-chart.js":6,"./ft-text-area.js":7,"./ft-value-axis.js":8}]},{},["modestCharts"]);