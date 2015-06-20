var GMapView = Backbone.View.extend({
		el: "#map_canvas",
		
		initialize: function(latlng) {
			
			_.bindAll(this, 'render', 'zoomToBounds');
			var latlng = new google.maps.LatLng(latlng[0],latlng[1]);
			var myOptions = {
				zoom: 16,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.TERRAIN
			};
			
			this.map = new google.maps.Map($(this.el)[0], myOptions);
			
		},
		
		render: function() {
			return this;
		},
		
		zoomToBounds: function( bounds ) {
		var latlngbounds = new google.maps.LatLngBounds(
			new google.maps.LatLng( bounds[0][1], bounds[0][0] ),
			new google.maps.LatLng( bounds[1][1], bounds[1][0] )
		);
		
		this.map._PolyGonzo_fitting = true;
		this.map.fitBounds( latlngbounds );
		this.map._PolyGonzo_fitting = false;
	}
		
});