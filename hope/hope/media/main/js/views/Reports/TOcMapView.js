var TOcMapView = Backbone.View.extend({
	id: "toc_map",
	editMode: false,
	controls: {},
	layers: {}, 
	panel: null,
	
	initialize: function() {

		/*** CUSTOM OPENLAYERS CONTROL ***/
		OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
            defaultHandlerOptions: {
                'single': true,
                'double': false,
                'pixelTolerance': 0,
                'stopSingle': false,
                'stopDouble': false
            },

            initialize: function(options) {
                this.handlerOptions = OpenLayers.Util.extend(
                    {}, this.defaultHandlerOptions
                );
                OpenLayers.Control.prototype.initialize.apply(
                    this, arguments
                ); 
                this.handler = new OpenLayers.Handler.Click(
                    options.view, {
                        'click': options.view.changeReportLocation
                    }, this.handlerOptions
                );
            }, 

            trigger: function(e) {
               //console.log("none");
            }

        });
		/** ----------- **/

		_.bindAll(this, 'render', 'changeOccurrence', 'onStartEdit', 'onStopEdit', 'cancelEdit','resetGeometry', 'onLoadEditLayer');
		
		this.layers.edit = new OpenLayers.Layer.Vector("Editable Geometry");
		/* init projection */
		this.projection = new OpenLayers.Projection("EPSG:4326");

		/* new panel instance, this panel has draw feature controls */
		this.panel = new OpenLayers.Control.EditingToolbar(this.layers.edit);
		
		/* initialize map */
		this.mapObj = new OpenLayers.Map({	
											div: this.id, 
											controls: 	[ 	
															new OpenLayers.Control.Navigation({zoomWheelEnabled:false}),
															new OpenLayers.Control.LayerSwitcher(),
															this.panel, 
															new OpenLayers.Control.PanZoomBar(),
															new OpenLayers.Control.DragPan()
														]
										});
		/* add layers */
		this.addLayers();

		this.mapObj.zoomToMaxExtent();
        
		var lat = 40.2, lng = -8.416667;
		if (this.options.lat && this.options.lng){
			lat = this.options.lat;
			lng = this.options.lng;
		}
		
		this.mapObj.setCenter(	new OpenLayers.LonLat(lng,lat).transform(	this.projection,  	
																			this.mapObj.getProjectionObject())
								, 13);
		
		
		/* create marker icons */
		var size = new OpenLayers.Size(20,34);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		this.starticon = new OpenLayers.Icon('http://maps.google.com/mapfiles/marker.png',size,offset);
		this.endicon = new OpenLayers.Icon('http://maps.google.com/mapfiles/marker.png', size, offset);
				
		/* define shape style default style */
		OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '4';

		/* CLICK CONTROL */
		this.click = new OpenLayers.Control.Click({view: this});
		this.mapObj.addControl(this.click);
        this.click.deactivate();

        /* PANEL CONTROL */
		this.panel.deactivate();
          

		//console.log("TOC MAP RENDERED");	
	},

	addLayers: function() {
		var groad = new OpenLayers.Layer.Google("Google RoadMap",{ type: google.maps.MapTypeId.ROADMAP, minZoomLevel: 3, maxZoomLevel: 20, zoomWheelEnabled: false});
		var gsat = new OpenLayers.Layer.Google( "Google Sattelite",{ type: google.maps.MapTypeId.SATELLITE, minZoomLevel: 3, maxZoomLevel: 20, zoomWheelEnabled: false});
		
		this.markers = new OpenLayers.Layer.Markers("Markers");
		this.mapObj.addLayer(this.markers);
		this.mapObj.addLayer(this.layers.edit);
		this.mapObj.addLayers([groad,gsat]);

	},

	showAll: function() {
		
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
	
	changeOccurrence: function(occ){
		// do whatever you have to do remove previous model 

		this.layers.edit.destroyFeatures();

		if (this.model != undefined){
			this.model.unbind('change');
			this.clearMapMarkers();
		}
		
		
		if (occ){
			this.model = occ;
			// bind events 
			this.model.on('startEditGeo', this.onStartEdit);
			this.model.on('endEditGeo', this.onStopEdit);
			this.model.on('cancelEdit', this.cancelEdit);
			this.model.on('resetGeometry', this.resetGeometry);
			this.model.on('changeLocation', this.onChangeLocation, this);
			this.model.on('confirmLocation', this.onConfirmLocation, this);
			this.model.on('cancelLocation', this.onCancelLocation, this);

			
			// place start and end markers
			this.bounds = new OpenLayers.Bounds();
			
			var startObj = this.model.get('default_values')['coordinate'];
			var modelCoord = startObj.split(",");

			var startPoint = new OpenLayers.LonLat(modelCoord[1], modelCoord[0]);
			
			var tempMarker = new OpenLayers.Marker(	startPoint.transform( 	this.projection, 
																					this.mapObj.getProjectionObject())
															,	this.endicon.clone());

			tempMarker.events.register('mousedown', tempMarker, function(){/*console.log('TESTE')*/});


			this.markers.addMarker(tempMarker);
			this.bounds.extend(startPoint);

			// if model has coords
			this.centerByModel();			

			// load shapes if exists
			if(this.model.get('geom').length > 0)
				this.onLoadEditLayer();
			
		}
	},

	clearMapMarkers: function() {
		var markers = this.markers.markers;
		this.markers.clearMarkers();

		for(marker in markers)
			delete marker;
	},

	centerByModel: function() {
		this.clearMapMarkers();
		if (this.model.get('default_values')['coordinate'] != ''){
			var startObj = this.model.get('default_values')['coordinate'];
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

	cancelEdit: function(evt){
		this.onStopEdit({cancel:true});
	},
	
	onStartEdit: function(){
		this.panel.activate();
		app.log('starting to edit');
	},
	
	onStopEdit: function(evt){
		this.editMode = false;

        this.panel.deactivate();
		
		if (!evt || !evt.cancel){
			var in_options = {
				'internalProjection': this.mapObj.baseLayer.projection,
				'externalProjection': new OpenLayers.Projection("EPSG:4326")
			};
			
			var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
			if (this.layers.edit.features.length > 0)
				var elems = geojson_format.write(this.layers.edit.features);
			else
				var elems = [];

			// guarante it's not destroying shapes on post
			this.model.unset("destroy_shapes", { silent: true });

			//console.log(this.model);
			this.model.set('geom',elems)
			this.model.save();

			BarNotification.init({message: 'Report shapes updated.', type: 'success'});

		} else if(evt.cancel) {
			this.layers.edit.destroyFeatures();
			this.onLoadEditLayer();
		}
		app.log('end edit');

	},

	resetGeometry: function() {
		this.layers.edit.destroyFeatures();
	},
	
	onLoadEditLayer: function(){

		// clean shapes
		var in_options = {
			'internalProjection': this.mapObj.baseLayer.projection,
			'externalProjection': new OpenLayers.Projection("EPSG:4326")
		};
		 
		var geojson_format = new OpenLayers.Format.GeoJSON(in_options);
		var features = geojson_format.read(this.model.get('geom'));
		
		/*for(var i in features){
			bounds.extend(features[i].geometry.getBounds());
		}*/

		if(features) {
			this.layers.edit.addFeatures(features);
		}
		//this.mapObj.zoomToExtent(bounds);	
	},

	onChangeLocation: function() {
		this.click.activate();
		BarNotification.init({message: 'Click on the map to change location. Please note that the report will lose all shapes related!', type: 'alert'});
	},

	onConfirmLocation: function() {
		// save model
		// deactivate click control
		BarNotification.init({message: 'You have updated the report location!', type: 'success'});
		this.click.deactivate();
		this.centerByModel();
		//console.log("saving model...");
	},

	onCancelLocation: function() {
		// center map again on report
		// deactivate click control
		this.centerByModel();
		this.click.deactivate();

	},

	/* click event on map handled by custom map click control */
	changeReportLocation: function(e) {

		var lonlat = this.mapObj.getLonLatFromPixel(e.xy);
        this.mapObj.setCenter(new OpenLayers.LonLat(lonlat.lon,lonlat.lat),17);
        var newPoint = new OpenLayers.LonLat(lonlat.lon, lonlat.lat);
        /* clear markers */
		this.clearMapMarkers();

		//console.log('adding the ' + newPoint);
		this.markers.addMarker(new OpenLayers.Marker(newPoint));		
	},


	render: function() {
		return this;
	}

});