var OpenLayersView = Backbone.View.extend({
	id: "map_canvas",

	initialize: function(latlng) {

		_.bindAll(this, 'render');
		
		if ((typeof google) == 'undefined') {
			new Error({ message: 'Oops. Sem ligação à rede.'});
		} else {
			
			var options = { controls: [
				new OpenLayers.Control.Navigation(),
				new OpenLayers.Control.PanZoomBar(),
				new OpenLayers.Control.LayerSwitcher({'ascending':false}),
				new OpenLayers.Control.ScaleLine(),
				new OpenLayers.Control.KeyboardDefaults()
				] 
			}
			this.mapObj = new OpenLayers.Map(this.id,options);
		
		
		
			var gphy = new OpenLayers.Layer.Google(
				"Google Physical",
				{	type: google.maps.MapTypeId.TERRAIN,
				 	minZoomLevel: 3,
					maxZoomLevel: 20
				}
			);
			
			var groad = new OpenLayers.Layer.Google(
				"Google RoadMap",
				{	type: google.maps.MapTypeId.ROADMAP,
				 	minZoomLevel: 3,
					maxZoomLevel: 20
				}
			);
        	
			this.mapObj.addLayers([groad, gphy]);
			
			
			this.mapObj.setCenter(	new OpenLayers.LonLat(latlng[1],latlng[0]).transform(
															new OpenLayers.Projection("EPSG:4326"),
															this.mapObj.getProjectionObject()
															)
									, 13);
		}
		
	},

	render: function() {
		return this;
	}

});