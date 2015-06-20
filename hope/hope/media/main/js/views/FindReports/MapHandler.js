var MapHandler = Backbone.View.extend({
	id: "map_canvas",
	categories: [],
	shapeOccurrencesnces: [],
	bingApi: "Ajh4bRNoW057FZF_guDijh3eb1fSSyT8KvN3WoQcxqnwtXK9jLIAxY5Tl8iYssoY",


	initialize: function() {
		_.bindAll(this, 'render', 'hide', 'show', 'load', 'unload','updateCategories', 'updateMapFeatures','showSingle','clearMapMarkers');

		if ((typeof google) == 'undefined') {
			new Error({
				message: 'Oops. Sem ligação à rede.'
			});
		} else {
			this.projection = new OpenLayers.Projection("EPSG:4326");

			var options = { 
				controls: [
					new OpenLayers.Control.Navigation({zoomWheelEnabled:false}),
					new OpenLayers.Control.PanZoomBar(),
					new OpenLayers.Control.LayerSwitcher({
						'ascending': false
					}),
					new OpenLayers.Control.ScaleLine(),
					new OpenLayers.Control.KeyboardDefaults()
				]
			}
			this.mapObj = new OpenLayers.Map(this.id, options);

			var satLayer = new OpenLayers.Layer.Google("Google Sattelite", {
				type: google.maps.MapTypeId.SATELLITE,
				minZoomLevel: 3,
				maxZoomLevel: 20,
				tilt: 0,
				zoomWheelEnabled:false
			});

			var gsat = satLayer;

			var groad = new OpenLayers.Layer.Google("Google RoadMap", {
				type: google.maps.MapTypeId.ROADMAP,
				minZoomLevel: 3,
				maxZoomLevel: 20,
				zoomWheelEnabled:false
			});
	 
 
			//var osm = new OpenLayers.Layer.OSM();

			this.mapObj.addLayers([groad, gsat]);

			var latlng = [40.2, -8.416667] //Coimbra's coordinates

			this.mapObj.setCenter(new OpenLayers.LonLat(latlng[1], latlng[0]).transform(
				this.projection,
				this.mapObj.getProjectionObject()), 15);
			
			var style = new OpenLayers.Style({
				strokeColor: "${strokeColor}",
				//strokeColor: "#ff0000",
				strokeOpacity: 1,
				strokeWidth: 4,
				//strokeWidth: "2",
				strokeDashstyle: "${strokeDashstyle}",
				fillColor: "#FFFFFF",
				fillOpacity: 0.1,
				pointRadius: this.mapObj.getZoom() / 10,
				pointerEvents: "visiblePainted",

				fontColor: "#ff0000",
				fontSize: "15px",
				fontFamily: "Courier New, monospace",
				fontWeight: "bold",
				labelAlign: "lb"
			}, {
				context: {
					strokeColor: function(f) {
						return f.attributes.style.strokeColor;
					},
					strokeWidth: function(f) {
						return f.attributes.style.strokeWidth + 2;
					},
					strokeDashstyle: function(f) {
						return f.attributes.style.strokeDashstyle;
					}
				}
			});


			var size = new OpenLayers.Size(20,34);
			var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			this.markericon = new OpenLayers.Icon('http://moth.dec.uc.pt/media/images/markers/mapicons-7a4c7a/number_0.png',size,offset);


			this.markers = new OpenLayers.Layer.Markers("Markers");


			this.starticon = new OpenLayers.Icon('http://maps.google.com/mapfiles/marker.png',size,offset);
			this.endicon = new OpenLayers.Icon('http://maps.google.com/mapfiles/marker.png', size, offset);

			this.mapObj.addLayer(this.markers);

			/* 
				Add map events 
				here
			*/

			this._selectedFeature = null;

			$(".olMapViewport").append('<button class="btn btn-blue olRecenterMap" style="position: relative;z-index: 1000;float: right;top: 450px;right: 10px;"> Recenter Map </button>');
			var that = this;
			$(".olRecenterMap").on('click', function() {
				that.setMapCenter();
			});

			dispatcher.on('recenterMap', this.setMapCenter, this);

		}

	},

	setMapCenter: function() {
		//console.log("SET MAP CENTER TRIGGERED");
		if (window.app.lat && window.app.lng) {
			latlng = [window.app.lat, window.app.lng];
		}

		if(this.bounds) {
			this.mapObj.zoomToExtent(this.bounds,false);
		}
	},

	recenterMap: function() {
		this.mapObj.zoomToMaxExtent();
        
		var lat = 40.2, lng = -8.416667;
		if (this.options.lat && this.options.lng){
			lat = this.options.lat;
			lng = this.options.lng;
		}
		
		this.mapObj.setCenter(	new OpenLayers.LonLat(lng,lat).transform(	this.projection,  	
																			this.mapObj.getProjectionObject())
								, 13);
	},

	showSingle: function(coords) {
		this.clearMapMarkers();

		// place start and end markers
		this.bounds = new OpenLayers.Bounds();
		
		var startObj = coords;
		var modelCoord = startObj.split(",");

		var startPoint = new OpenLayers.LonLat(modelCoord[1], modelCoord[0]);
		
		this.markers.addMarker(new OpenLayers.Marker(	startPoint.transform( 	this.projection, 
																				this.mapObj.getProjectionObject())
														,	this.endicon.clone()));
		this.bounds.extend(startPoint);

		//console.log('show single');

		// if model has coords
		this.centerByModel(coords);		

		
	},

	centerByModel: function(coords) {
		this.clearMapMarkers();
		if (coords){
			var startObj = coords;
			var modelCoord = startObj.split(",");
			var endPoint = new OpenLayers.LonLat(modelCoord[1], modelCoord[0]);
    	
			this.markers.addMarker(new OpenLayers.Marker(	endPoint.transform(	this.projection, 
																				this.mapObj.getProjectionObject())
														, 	this.starticon.clone()));
			this.bounds.extend(endPoint);
			this.mapObj.setCenter(new OpenLayers.LonLat(modelCoord[1],modelCoord[0]).transform(	this.projection,  	
																			this.mapObj.getProjectionObject()),13);

			this.mapObj.zoomTo(this.mapObj.getNumZoomLevels()-1);
			this.mapObj.zoomToExtent(this.bounds,false);
		}
	},

	clearMapMarkers: function() {
		var markers = this.markers.markers;
		this.markers.clearMarkers();

		for(marker in markers)
			delete marker;
	},

	updateMapFeatures: function() {

		var bounds = this.mapObj.getExtent().transform(this.mapObj.getProjectionObject(), this.projection);
		// clear markers on map
		this.markers.clearMarkers();
		
		if (this.occurrenceList) this.occurrenceList = null;
		this.occurrenceList = new TemporaryOccurrenceList({'category_id': this.categories});
		this.occurrenceList.on('reset', this.renderShapes,this);


		/*
		if(this.shapes) this.shapes = null;
		this.shapes = new ShapeList({'category_id':this.categories});

		this.shapes.on('reset', this.renderShapes,this);
		*/
		

		var that = this;
		this.occurrenceList.view = this;
		//this.shapes.fetch({reset:true});
		this.occurrenceList.fetch({reset:true});
	},

	onMarkerClick: function(marker) {
		marker.view.trigger('selectFeature', marker.occ_id);
		//OpenLayers.Event.stop(evt);
	},

	updateCategories: function(categories) {
		//console.log(categories);
		this.categories = categories;
		this.updateMapFeatures();
		//this.renderShapes();
	},

	renderShapes: function() {

		//console.log("Render Shapes");

		//console.log(this.occurrenceList);

		var that = this;

		var occTable = this.options.occTable;
		occTable.fnClearTable();

		// check if the model is actually an occurrence and not a response with success value
		if(this.occurrenceList.length > 0 && this.occurrenceList.models[0].get('user_id') != undefined) {
			this.bounds = new OpenLayers.Bounds();
			
			this.occurrenceList.each(function(occ) {

				that.renderTableLine(occ,occTable);

				// place start and end markers
				
				
				var startObj = occ.get('coordinate');
				var modelCoord = startObj.split(",");
				var size = new OpenLayers.Size(21,25);
				var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);

				if(occ.get('is_owner'))
					markericon = new OpenLayers.Icon('http://moth.dec.uc.pt/media/images/markers/mapicons-ff6f00/number_' + occ.get('vote_counter') + '.png',size,offset);
				else
					markericon = new OpenLayers.Icon('http://moth.dec.uc.pt/media/images/markers/mapicons-c27438/number_' + occ.get('vote_counter') + '.png',size,offset);



				var startPoint = new OpenLayers.LonLat(modelCoord[1], modelCoord[0]);

				marker = new OpenLayers.Marker(	startPoint.transform( 	that.projection, 
																						that.mapObj.getProjectionObject())
																,	markericon.clone());

				marker.occ_id = occ.get('id');
				// pass the view so we can use the callback function in right context
				marker.view = that;

				marker.events.remove('mousedown');

				// need to make an anonymous function so we have the 
				// right value when triggering the event
				// this is a classic JavaScript trap: you're instantiating functions as event handlers in a loop, 
				// and the functions refer to a local variable

				marker.events.register('mousedown', marker, (function(i) { return function() { that.onMarkerClick(i); } }(marker)));
				marker.events.register('mouseover', marker, (function(i) { return function() { /*console.log($(i));*/ $(i.icon.imageDiv).css('cursor','pointer') } }(marker)));



				that.markers.addMarker(marker);
				that.bounds.extend(startPoint);

			});

			BarNotification.remove();

			// change cursor of table row
			$("#occurrences-table tr").css('cursor', 'pointer');
			this.mapObj.zoomToExtent(this.bounds,false);
		}
	},

	renderTableLine: function(model, table) {

		td0 = model.get('id');
		td1 = model.get('title');
        td2 = model.get('coordinate');
        td3 = model.get('category_name');
        td4 = model.get('created_at');

        table.fnAddData([td0,td1,td2,td3,td4]);
	},

	show: function() {
		$(this.el).fadeIn('fast');
	},

	hide: function() {
		$(this.el).fadeOut('fast');
	},

	load: function() {
		this.render();
	},

	unload: function() {
		this.hide();
	},

	getBBox: function() {
		return this.mapObj.getExtent();
	},

	drawRecord: function(model) {
		this.renderShapes(model);
	},

	clearMap: function() {
		this.results_layer.destroyFeatures();
	},

});
