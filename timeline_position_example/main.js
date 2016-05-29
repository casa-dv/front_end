/**
 * Map setup
 */
console.log("Step 0: load main.js");

function load_map(id,options){
  console.log("Step 2: load map "+id);

  var map = L.map(id).setView([options.lat, options.lng], options.zoom);

  var access_token = 'pk.eyJ1IjoidG9tYWxydXNzZWxsIiwiYSI6Im9TM1lfSWsifQ.0dE4yPsqc7HJbBT22ceU5g';
  var mapbox_style = 'mapbox.satellite';
  var tile_url = 'https://{s}.tiles.mapbox.com/v4/' + mapbox_style + '/{z}/{x}/{y}.png?access_token=' + access_token;

  L.tileLayer(tile_url, {
      attribution: 'Imagery &copy; <a href="//mapbox.com">Mapbox</a>',
      maxZoom: 16
  }).addTo(map);

  return map;
}

function load_data_for_map_places(){
  d3.json('http://casa-dv.made-by-tom.co.uk/places?lat='+options.lat+"&lon="+options.lng+"&type=cafe", function(response){
      console.log("Step 3: done loading place data, now add it to the map");

      L.geoJson(response, {
          onEachFeature: function (feature, layer) {
              layer.on("click",function(){
                document.getElementById("place_name").innerHTML = feature.properties.name;
              });
          }
      }).addTo(window.maps.map_places);
  });
}

function load_data_for_map_events(){
  d3.json('http://casa-dv.made-by-tom.co.uk/eventbrite?lat='+options.lat+"&lon="+options.lng, function(response){
      console.log("Step 3: done loading event data, now add it to the map");

      var timeline = L.timeline(response, {
          onEachFeature: function (feature, layer) {
              layer.on("click",function(){
                console.log(feature.properties);
                // TODO fill in details with event time, description etc.
              });
          }
      }).addTo(window.maps.map_events);

      // create timeline control
      var timelineControl = L.timelineSliderControl({
          formatOutput: function(date){
              return moment(date).format("YYYY-MM-DD");
          },
          enableKeyboardControls: true,
      });

      // add timeline control to page
      var timelineControlElement = timelineControl.onAdd(maps.map_events);
      timelineControl.addTimelines(timeline);
      document.getElementById('timeline').appendChild(timelineControlElement);

  });
}


function setup(){
  console.log("Step 1: set up options");

  var options = {
    lat: 51.5218991,
    lng: -0.1381519,
    zoom: 15
  };

  window.options = options;
  window.maps = {};

  var map_ids = [
    "map_buses",
    "map_places",
    "map_events"
  ];

  // http://casa-dv.made-by-tom.co.uk/eventbrite?lat=51.5218991&lon=-0.1381519
  // http://casa-dv.made-by-tom.co.uk/forecast?lat=51.5218991&lon=-0.1381519

  for (var i = 0; i < map_ids.length; i++) {
    maps[map_ids[i]] = load_map(map_ids[i], options);
  }

  load_data_for_map_places();
  load_data_for_map_events();
}


setup();