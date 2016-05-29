/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {
	'use strict';

	var map_start_location = [51.501603, -0.125984, 16];    // LDN
	var map = L.map('map',
		{"keyboardZoomOffset" : 0.05}
	);
	map.setView(map_start_location.slice(0, 3), map_start_location[2]);

	var layer = Tangram.leafletLayer({
		scene: 'scene.yaml',
		preUpdate: pre_update,
		attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
	});

	window.layer = layer;
	window.scene = layer.scene;

	function pre_update(will_render) {
		if (!will_render) {
			return;
		}
		daycycle();
	}

	function daycycle() {
		var d = window.sliderTime; // unix ms
		if(!d){
			return;
		}

		var t = (3.14159 * (+moment(d).format('k') - 1) / 12) + 3.14159;

		var x = Math.sin(t);
		var y = Math.sin(t+(3.14159/2)); // 1/4 offset
		var z = Math.sin(t+(3.14159)); // 1/2 offset

		console.log(x);

		scene.view.camera.axis = {x: x, y: y};

		// offset blue and red for sunset and moonlight effect
		var B = x + Math.abs(Math.sin(t+(3.14159*0.5)))/4;
		var R = y + Math.abs(Math.sin(t*2))/4;

		scene.lights.sun.diffuse = [R, y, B, 1];
		scene.lights.sun.direction = [x, 1, -0.5];

		var px = Math.min(x, 0); // positive x
		var py = Math.min(y, 0); // positive y

		// light up the roads at night
		scene.styles["roads"].material.emission.amount = [-py, -py, -py, 1];

		// turn water black at night
		scene.styles["water"].material.ambient.amount = [py+1, py+1, py+1, 1];
		scene.styles["water"].material.diffuse.amount = [py+1, py+1, py+1, 1];

		// turn up buildings' ambient response at night
		var ba = -py*.75+.75;
		scene.styles["buildings"].material.ambient.amount = [ba, ba, ba, 1];

		scene.animated = true;
	}


	/***** Render *****/
	window.addEventListener('load', function () {
		layer.addTo(map);
	});

	function load_weather() {
		window.weather = JSON.parse(this.responseText);
		console.log(weather);
	}

	var r = new XMLHttpRequest();
	r.addEventListener("load", load_weather);
	r.open("GET", "http://casa-dv.made-by-tom.co.uk/forecast?lat=51.5218991&lon=-0.1381519");
	r.send();

	var slider = document.getElementById('timeline');

	var now = moment().valueOf();
	window.sliderTime = now;
	var then = moment().add(7,'days').valueOf();

	noUiSlider.create(slider, {
		start: now,
		step: 1000*60*60, // ms
		range: {
			'min': now,
			'max': then
		},
		pips: { // Show a scale with the slider
			mode: 'steps',
			density: 3,
			filter: function(value,type){
				var hour = +moment(value).format('k');
				if(hour === 24){
					return 1;
				}
				if (hour % 6 === 0){
					return 2;
				}
				return 0;
			},
			format: {
				to: function(value){
					if(+moment(value).format('k') === 24){
						return moment(value).format('dddd');
					} else {
						return moment(value).format('ha');
					}
				}
			}
		}
	});
	slider.noUiSlider.on('update', function( values, handle ) {
		window.sliderTime = parse_slider_value(values);
	});

	function parse_slider_value(values){
		return +(values[0]);
	}


	return map;


}());