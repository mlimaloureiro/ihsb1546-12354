/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Layer.js
 * @requires OpenLayers/Layer/Markers.js
 */

/**
 * Class: OpenLayers.Layer.Boxes
 * Draw divs as 'boxes' on the layer. 
 *
 * Inherits from:
 *	- <OpenLayers.Layer.Markers>
 */
OpenLayers.Layer.DMarkers = OpenLayers.Class(OpenLayers.Layer.Markers, {

	/**
	 * Constructor: OpenLayers.Layer.Boxes
	 *
	 * Parameters:
	 * name - {String} 
	 * options - {Object} Hashtable of extra options to tag onto the layer
	 */
	initialize: function (name, options) {
		OpenLayers.Layer.Markers.prototype.initialize.apply(this, arguments);
	},
	
	/**
	 * Method: drawMarker 
	 * Calculate the pixel location for the marker, create it, and
	 *	  add it to the layer's div
	 *
	 * Parameters: 
	 * marker - {<OpenLayers.Marker.Box>} 
	 */
	drawMarker: function(marker) {
		var lonlat	 = marker.lonlat;
		var px = this.map.getLayerPxFromLonLat(lonlat);
		var sz = new OpenLayers.Size(15,30);
			
		var markerDiv = marker.draw(px, sz);
		if (!marker.drawn) {
			this.div.appendChild(markerDiv);
			marker.drawn = true;
		}
	},


	/**
	 * APIMethod: removeMarker 
	 * 
	 * Parameters:
	 * marker - {<OpenLayers.Marker.Box>} 
	 */
	removeMarker: function(marker) {
		OpenLayers.Util.removeItem(this.markers, marker);
		if ((marker.div != null) &&
			(marker.div.parentNode == this.div) ) {
			this.div.removeChild(marker.div);	 
		}
	},

	CLASS_NAME: "OpenLayers.Layer.DMarkers"
});
