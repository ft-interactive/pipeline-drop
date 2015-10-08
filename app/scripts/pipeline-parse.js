'use strict';
console.log("parser here");

function pipelineParse( text, opts ){
	function getProperties( lines ){
		var p = {};
		for(var i = 0; i <lines.length; i++){
			var tabs = lines[i].split('\t');		
			if(tabs[0] === '&'){
				p.headings = tabs;
			}else{
				var bits = lines[i].split('=');
				bits[0] = bits[0].replace('&','').trim();
				bits[1] = bits[1].trim();
				if(bits[1] != 'delete if not required'){
					if(bits[0] == 'valueDomain'){
						bits[1] = bits[1].split(',').map(function(d){ return parseInt(d, 10); });
					}
					p[bits[0]] = bits[1];
				}
			}
		}
		return p;
	}

	var lines = text.split('\n'),
	specialLines = lines.filter(function(line){
		return (line.indexOf('&') == 0);
	}),
	pipeline = getProperties(specialLines);
	
	if(!pipeline.headings){
		return "no headings!";
	}
	
	pipeline.data = lines.filter(function(line){
		return !(line.indexOf('&') == 0 || line.trim() == '');
	}).map(function(d){
		var bits = d.split('\t')
		var row = {};
		for (var h in pipeline.headings){
			row[pipeline.headings[h]] = bits[h];
		}
		//console.log(row)
		return row;
	});
	console.log('pipeline ' , pipeline)
	return pipeline;
}

