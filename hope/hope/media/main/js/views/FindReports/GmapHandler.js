var GmapHandler = Backbone.View.extend({
	id: "map_canvas",
	categories: [],
	markers: [],
	map: null,
	bounds: null,
	occurrenceList: null,
	markerCluster: null,

	initialize: function() {
		_.bindAll(this, 'initMaps', 'deleteOverlays', 'resetMaps');
		this.initMaps();
	},

	toggleCluster: function(element) {
		
	},

	initDrawing: function() {
		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.MARKER,
					google.maps.drawing.OverlayType.CIRCLE,
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.POLYLINE,
					google.maps.drawing.OverlayType.RECTANGLE
				]
			},
			circleOptions: {
				fillColor: '#ffff00',
				fillOpacity: 1,
				strokeWeight: 5,
				clickable: false,
				editable: true,
				zIndex: 1
			}
		});
		drawingManager.setMap(this.map);
	},

	initMaps: function() {
		this.currentLocation = new google.maps.LatLng(40.20000, -8.41667);

		var stylez = [
			{
				featureType: "all",
				elementType: "all",
				stylers: [
					{ saturation: -100 } // <-- THIS
				]
			}
		];

		var mapOptions = {
			zoom: 12,
			center: this.currentLocation,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'tehgrayz']
			}
		};

		this.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
		var mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" });

		this.map.mapTypes.set('tehgrayz', mapType);
		this.map.setMapTypeId('tehgrayz');

		this.markers = [];
		this.bounds = new google.maps.LatLngBounds();
		// Drawing
		/*this.initDrawing(); */
	},

	deleteOverlays: function() {
		if (this.markerCluster != null) {
			this.markerCluster.clearMarkers();
		}
		for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(null);
		};
		this.markers = [];
		this.bounds = new google.maps.LatLngBounds();
		//this.markerCluster.addMarkers(that.markers);
		//this.markerCluster.redraw();
	},

	resetMaps: function() {
		for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(null);
		};
		this.markers = [];
		this.bounds = new google.maps.LatLngBounds();
		this.bounds.extend(new google.maps.LatLng(40.20000, -8.41667));
		this.map.fitBounds(this.bounds);
		this.map.setZoom(12);
	},

	updateCategories: function(categories) {
		this.categories = categories;
		this.updateMapFeatures();
	},

	updateMapFeatures: function() {
		this.deleteOverlays();
		this.occurrenceList = new TemporaryOccurrenceList({'category_id': this.categories});
		this.occurrenceList.on('reset', this.renderOccurrences, this);
		this.occurrenceList.view = this;
		this.occurrenceList.fetch({reset:true});
	},

	renderOccurrences: function() {
		var that = this;

		var occTable = this.options.occTable;
		occTable.fnClearTable();

		if (this.occurrenceList.length > 0 && this.occurrenceList.models[0].get('user_id') != undefined) {
			this.occurrenceList.each(function(occ) {
				// Render table
				that.renderTableLine(occ, occTable);

				// Render marker
				var coordinates = occ.get('coordinate').split(",");
				// if owner

				// else
				var markerLatlng = new google.maps.LatLng(coordinates[0], coordinates[1]);

				var marker = new google.maps.Marker({
					position: markerLatlng,
					icon: "https://dl.dropboxusercontent.com/u/5427257/spero-ico.png"
				});

				marker.view = that;
				marker.occ_id = occ.get("id");

				google.maps.event.addListener(marker, 'click', function(event) {
					that.markerClick(event, marker);
				});

				that.markers.push(marker);
				that.bounds.extend(markerLatlng);

			});
			//var size = 100;
			that.markerCluster = new MarkerClusterer(that.map, that.markers);
			that.markerCluster.setMaxZoom(15);
			that.map.fitBounds(that.bounds);
			
			$("#hide-cluster-btn").on('click', function() {
				if ($(this).hasClass("hidding_cluster")) {
					/* Hide normal markers */
					for (var i = 0; i < that.markers.length; i++) {
						that.markers[i].setMap(null);
					};
					
					/* Create cluster */
					that.markerCluster = new MarkerClusterer(that.map, that.markers);
					that.markerCluster.setMaxZoom(15);

					/* Define btn name */
					$(this).html("<i class='icon-cog'></i> Hide Cluster");
					$(this).removeClass("hidding_cluster");
				} else {
					/* Clear cluster */
					that.markerCluster.clearMarkers();
					that.markerCluster = null;

					/* Show normal markers */
					for (var i = 0; i < that.markers.length; i++) {
						that.markers[i].setMap(that.map);
					};

					/* Define btn name */
					$(this).html("<i class='icon-cog'></i> Show Cluster");
					$(this).addClass("hidding_cluster");
				}
			});
		}
	},

	markerClick: function(event, marker) {
		marker.view.trigger('selectFeature', marker.occ_id);
	},

	showSingle: function(coords) {
		var that = this;

		this.deleteOverlays();
		var coordinates = coords.split(",");
		var markerLatlng = new google.maps.LatLng(coordinates[0], coordinates[1]);

		var marker = new google.maps.Marker({
			position: markerLatlng,
			map: that.map,
			icon: "https://dl.dropboxusercontent.com/u/5427257/spero-ico.png"

		});

		marker.view = that;

		that.markers.push(marker);
		that.bounds.extend(markerLatlng);
		that.map.fitBounds(that.bounds);
		that.markerCluster.addMarkers(that.markers);
		that.markerCluster.redraw();
	},

	renderTableLine: function(model, table) {

		td0 = model.get('id');
		td1 = model.get('title');
        td2 = model.get('coordinate');
        td3 = model.get('category_name');
        td4 = model.get('created_at');

        table.fnAddData([td0,td1,td2,td3,td4]);
	},

	load: function() {
		//console.log("[GmapHandler] load");
	}
});