var DrawingHandler = Backbone.View.extend({

	events: {
		'click #delete-shape-btn': 'deleteSelectedShape',
		'click #show-shape-btn': 'showShapes',
		'click #save-shape-btn': 'saveShapes'
	},

	el: $("#page"),
	selectedShape: null,
	drawingManager: null,
	shapes: [],
	shapesPolygons: [],
	model: null,
	view: null,
	report_view: null,
	selectedReport: null,

	initialize: function() {
		this.map = this.options.map;
		this.view = this.options.view;
		this.report_view = this.options.report_view;
		this.shapes = this.options.shapes;
		this.selectedReport = this.options.selectedReport;
		this.initDrawing();
		this.convertShapes();
		this.delegateEvents();
	},

	initDrawing: function() {
		var polyOptions = {
          strokeWeight: 0,
          fillOpacity: 0.45,
          editable: true
        };

		this.drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: null,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.POLYLINE
				]
			},
			polylineOptions: {
            	editable: true
          	},
          	rectangleOptions: polyOptions,
          	circleOptions: polyOptions,
          	polygonOptions: polyOptions
		});
		this.drawingManager.setMap(this.map);
		this.setListeners();
		
	},

	changeOccurrence: function(shapes, report) {
		this.shapes = shapes;
		this.selectedReport = report;
		
		/* Reset Selected shape */
		this.selectedShape.setMap(null);
		this.selectedShape = null;
		
		/* Reset array of polygons */
		for (var i = 0; i < this.shapesPolygons.length; i++) {
			this.shapesPolygons[i].setMap(null);
			this.shapesPolygons[i] = null;
		};
		this.shapesPolygons = [];

		/* Convert new shapes to polygons */
		this.convertShapes();
	},

	convertShapes: function() {
		console.log("CONVERT SHAPES");
		console.log(this.shapes);
		var that = this;
		if (this.shapes) {
			var polygonCoords = []
			for (var i = 0; i < this.shapes.length; i++) {
				polygonCoords.push(new google.maps.LatLng(this.shapes[i].lat, this.shapes[i].lng));
			};
			var polygon = new google.maps.Polygon({
				paths: polygonCoords
			});
			this.shapesPolygons.push(polygon);
			google.maps.event.addListener(polygon, 'click', function() {
				that.setSelection(polygon);
			});
		} else {
			this.shapes = []
			this.convertShapes();
		}
		//polygon.setMap(this.map);
	},

	setListeners: function() {
		var that = this;
		console.log("set listeners.");
		google.maps.event.addListener(that.drawingManager, 'overlaycomplete', function(e) {
			console.log("overlaycomplete");
			if (e.type != google.maps.drawing.OverlayType.MARKER) {
				// Switch back to non-drawing mode after drawing a shape.
				that.drawingManager.setDrawingMode(null);

				// Add an event listener that selects the newly-drawn shape when the user
				// mouses down on it.
				var newShape = e.overlay;
				newShape.type = e.type;
				google.maps.event.addListener(newShape, 'click', function() {
					that.setSelection(newShape);
				});
				that.setSelection(newShape);
			}
		});

		google.maps.event.addListener(that.drawingManager, 'drawingmode_changed', that.clearSelection);
        google.maps.event.addListener(that.map, 'click', that.clearSelection);
	},

	deleteSelectedShape: function() {
		console.log("[DrawingHander] delete selected shape.");
		if (this.selectedShape) {
			this.selectedShape.setMap(null);
			this.selectedShape = null;
		}
	},

	setSelection: function(shape) {
		console.log("[DrawingHander] set selection.");
		this.clearSelection();
		this.selectedShape = shape;
		shape.setEditable(true);
	},

	clearSelection: function() {
		console.log("[DrawingHander] clear selection.");
		if (this.selectedShape) {
			this.selectedShape.setEditable(false);
			this.selectedShape = null;
		}
		$("#show-shape-btn").addClass('showing_shapes');
		$("#show-shape-btn").html("<i class='icon-search'></i> Hide Shapes");
		$(".edit_shapes").show();
		if (this.shapesPolygons) {
			if (this.shapesPolygons.length > 0) {
				for (var i = 0; i < this.shapesPolygons.length; i++) {
					this.shapesPolygons[i].setMap(this.map);
				};
			}
		}
	},

	showShapes: function() {
		console.log('[DrawingHander] click Show/Hide shapes handler.');

		if ($("#show-shape-btn").hasClass('showing_shapes')) {
			$("#show-shape-btn").removeClass('showing_shapes')
			$(".edit_shapes").hide();
			$("#show-shape-btn").html("<i class='icon-search'></i> Show Shapes");
			this.hideShapes();
		} else {
			console.log('[DrawingHander] Show Shapes.');
			$("#show-shape-btn").addClass('showing_shapes');
			$(".edit_shapes").show();
			$("#show-shape-btn").html("<i class='icon-search'></i> Hide Shapes");
			if (this.shapesPolygons.length > 0) {
				console.log("POLYGONS:");
				console.log(this.shapesPolygons);
				for (var i = 0; i < this.shapesPolygons.length; i++) {
					if (this.shapesPolygons[i] != null) {
						this.shapesPolygons[i].setMap(this.map);
					}
				};
			}
			if (this.selectedShape) {
				this.selectedShape.setMap(this.map);
			}
		}
	},

	hideShapes: function() {
		console.log('[DrawingHander] hide Shapes.');
		if (this.shapesPolygons.length > 0) {
			for (var i = 0; i < this.shapesPolygons.length; i++) {
				this.shapesPolygons[i].setMap(null);
			};
		}

		if (this.selectedShape) {
			this.selectedShape.setMap(null);
		}
	},

	saveShapes: function() {
		if (this.selectedShape) {
			console.log("set editable false");
			this.selectedShape.setEditable(false);
		}
		console.log("[DrawingHander] saving shape.");
		//console.log(this.report_view);
		this.report_view.confirmOccurrence(null);

	},

	getSelectedShape: function() {
		
		if (this.selectedShape) {
			var coordinates = (this.selectedShape.getPath().getArray());
			var shape = {
				coordinates: []
			}
			for (var i = 0; i < coordinates.length; i++) {
				shape.coordinates.push({
					lat: coordinates[i].lat(),
					lng: coordinates[i].lng()
				});
			};
			console.log("shape to get:");
			console.log(shape);
			return shape;
		} else {
			return false;
		}
	},

	deleteShapes: function() {
		this.hideShapes();
		for (i in this.shapes) {
			this.shapes[i] = null;
		}

		for (i in this.shapesPolygons) {
			this.shapesPolygons[i] = null;
		}
		this.shapesPolygons.length = 0;
		this.shapes.length = 0;
		this.selectedShape = null;
	},

	resetHandler: function() {
		this.deleteShapes();
		this.drawingManager.setMap(null);
		this.drawingManager = null;
	}
});