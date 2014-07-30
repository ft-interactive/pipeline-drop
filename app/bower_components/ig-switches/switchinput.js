'use strict';
/* jshint -W098*/
function switchInputFactory(id, states, options){
	if(states === undefined || states.length < 1){
		states = ['on','off'];
	}
	function setDefault(option, defaultValue){
		if(option===undefined){
			option = defaultValue;
		}
		return option;
	}


	if(!states){ states = ['on','off']; }
	if(!options){ options = {}; }

	var switchInput = {
		states:states,
		id:id,
		defaultState:states[0],
		lookup:{},
		disabledStates:[],
		activeClass:'active-switch-state',
		inactiveClass:'inactive-switch-state',
		disabledClass:'disabled-switch-state'
	};


	for(var o in options){
		switchInput[o] = options[o];
	}

	$('#'+switchInput.id).addClass('input-switch');


	switchInput.changeState = function(stateName){
		switchInput.state = stateName;
		toggleSwitch(getStateID(stateName));
		$(switchInput).trigger('state-change');
	};

	switchInput.disableState = function(state){
		$('#'+getStateID(state))
			.removeClass(switchInput.activeClass)
			.removeClass(switchInput.inactiveClass)
			.addClass(switchInput.disabledClass);

		switchInput.disabledStates[state] = true;

		//if the current state is being disabled move to the next enabled state
		if(switchInput.state === state){
			var currentIndex = switchInput.states.indexOf(state);
			var newStateSet = false;
			for (var i = currentIndex; (!newStateSet) && (i < switchInput.states.length); i = (i+1)%(switchInput.states.length)){
				if( !switchInput.disabledStates[switchInput.states[i]] ){
					switchInput.changeState(switchInput.states[i]);
					break;
				}
			}
		}
	};

	switchInput.enableState = function(state){
		switchInput.disabledStates[state] = false;
		if(switchInput.state === undefined){
			switchInput.state = state;
		}
		toggleSwitch(getStateID(switchInput.state));
	};


	function getStateID(state){
		var s = switchInput.id+'-'+state.replace(/[\W\s]/g,'_');
		return s;//switchInput.id+'-'+state;
	}

	function toggleSwitch(activeID){
		$('.' + switchInput.id + '-state')
			.removeClass(switchInput.activeClass)
			.addClass(switchInput.inactiveClass);
		$('#'+activeID)
			.removeClass(switchInput.inactiveClass)
			.addClass(switchInput.activeClass);
		for(var state in switchInput.disabledStates){
			if(switchInput.disabledStates[state]){
				$('#'+getStateID(state))
					.removeClass(switchInput.inactiveClass)
					.removeClass(switchInput.activeClass)
					.addClass(switchInput.disabledClass);
			}
		}
	}

	$.each(switchInput.states, function(i){
		var newID = getStateID(switchInput.states[i]);
		$('#'+switchInput.id)
			.append('<div id="' + newID + '" class="' + switchInput.id + '-state ' + switchInput.inactiveClass +'">' + switchInput.states[i] + '</div>');
	});

	$('.' + switchInput.id + '-state').on('click', function(ev){
		var stateName = ev.target.id.split(switchInput.id + '-')[1];
		if(!switchInput.disabledStates[stateName]){
			switchInput.changeState(stateName);
		}
	});

	switchInput.changeState(switchInput.defaultState);

	return switchInput;
}