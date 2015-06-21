/*
|--------------------------------------------------------------------------
| ReportFormView
|--------------------------------------------------------------------------
| This view generates the form element for the specific type of element
| It's a subview of ReportView created when loading an object
| 
*/
var ReportFormView = Backbone.View.extend({

	events: {
		'click .confirm_occurrence': 'confirmOccurrence',
		'click .delete_occurrence': 'promptDeleteOccurrence',
		'click .confirm_geometry': 'confirmGeometry',
		'click .edit_geometry': 'editGeometry',
		'click .edit_details': 'editDetails',
		'click .cancel_edit': 'cancelEdit',
		'click .delete_geometry': 'deleteGeometry',
		'click .validate_occurrence': 'validateOccurrence',
		'click .unvalidate_occurrence': 'unvalidateOccurrence',
		'click .change_location': 'changeLocation',
		'click .confirm_location': 'confirmLocation',
		'click .cancel_occurrence_changes': 'cancelEditDetails',
		'click .cancel_location': 'cancelLocation',
		'click .modal_follow': 'createModal',
		'click .add_video' : 'displayVideoForm',
		'click .cancel_submit_video' : 'cancelVideoForm',
		'click .submit_video': 'submitVideoForm',
	},

	editMode: false,
	drawingHandler: null,
	serverURL: window.location.origin,

	/**
	 *
	 * init function that creates the model and handles event delegation
	 *
	 **/
	initialize: function() {

		_.bindAll(this, 'changeOccurrence', 'render','initDrawing', 'confirmOccurrence', 'deleteOccurrence', 'editGeometry', 'cancelEdit', 'deleteGeometry');

		$.fn.editable.defaults.mode = 'popup';

		var that = this;

		this.model = new TemporaryOccurrence({
			_id: this.options.model_id
		});
		this.model.on('change', this.isConfirmed);
		this.model.on('updateSchema', this.render);

		this.model.collection = this.options.collection;
		this.view = this.options.view;

		this.model.view = this;
		this.map = this.options.map;

		this.model.fetchWithSchema({
			success: function(model, resp) {
				that.changeOccurrence(model);
				console.log("model:");
				console.log(model);
				if (model.elementModel.get('default_values')['permission'] == 1) {
					that.initDrawing();
				}
			},
			error: function(model, resp) {
				app.log('Temporary Occurrence not found');
			}
		});	
		
	},

	init: function() {
		this.model.fetchWithSchema();
	},

	initDrawing: function() {
		var that = this;
		
		console.log("[ReportFormView] initDrawing");
		console.log(this.model);
		var shapes = [];

		if (this.model.get('geom')) {
			shapes = this.model.get('geom')["coordinates"];
			console.log("Init drawing geom:");
			console.log(shapes);
		}
		this.drawingHandler = new DrawingHandler({
			map: that.map,
			view: that.view,
			report_view: that,
			selectedReport: that.selectedReport,
			shapes: shapes
		});
	},

	resetDrawing: function() {
		if (this.drawingHandler) {
			this.drawingHandler.undelegateEvents();
			this.drawingHandler.unbind();
			this.drawingHandler.resetHandler();
			this.drawingHandler = null;
		}
	},

	changeOccurrence: function(model) {
		//console.log("[ReportView] Change occurrence.");
		//console.log(model);

		this.view.resetMaps();

		var that = this;
		var coordinates = model.elementModel.get('default_values')['coordinate'].split(",");
		var title = model.elementModel.get('default_values')['title'];
		var mapLatlng = new google.maps.LatLng(coordinates[0], coordinates[1]);

		var drag = false;
		if (this.model.get('default_values')['permission'] == 1) {
			drag = true;
		}
		
		// @todo remove this later, resetMaps should handle this
		if (this.view.markers != null) {
			for (var i = 0; i < this.view.markers.length; i++) {
				this.view.markers[i].setMap(null);
			};
			this.view.markers.length = 0;
		}

		var marker = new google.maps.Marker({
			position: mapLatlng,
			map: this.view.map,
			draggable: drag,
			title: title,
			icon: "https://dl.dropboxusercontent.com/u/5427257/spero-ico.png"
		});

		if (drag) {
			google.maps.event.addListener(marker, 'dragend', function() {
				that.currentLocation = marker.getPosition();
				//console.log(that.model);
				var model_coords = "" + that.currentLocation.lat() + "," + that.currentLocation.lng();
				//console.log("coordinates:");
				//console.log(model_coords);
				bootbox.confirm("Are you sure you want to change the Coordinates ?", function(result) {
					if (result) {
						var defaults = that.model.get('default_values');
						defaults['coordinate'] = model_coords;

						that.model.set('default_values', defaults);
						//console.log(that.currentLocation);
						that.model.save().then(function() {
							//console.log("model coordinates");
							//console.log(that.model.get('coordinates'));
							that.model.view.view.occurrenceList.fetch({
								reset: true
							});
							that.reRenderContent();
						});
					} else {
						marker.setPosition(mapLatlng);
					}
				});
			});
		}

		this.view.markers.push(marker);
		this.view.map.setCenter(mapLatlng);
		this.view.map.setZoom(12);
	},

	displayVideoForm: function(evt) {
		console.log('DISPLAYING VIDEO');
		$('#form-edit-video').show();
	},

	submitVideoForm: function(evt) {
		evt.preventDefault();
		var $val = $('#input_video_url_form').val();
		
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	    var match = $val.match(regExp);
	    if (match && match[2].length == 11){
	        $.post(this.serverURL + "/hope/occurrences/insert_video/" + this.model.get('default_values')['id'] + "/", {
				'video_url' : $val
			}, function(data) {
				console.log(data);
				BarNotification.remove();
			});
	    }
	    else{
	        BarNotification.init({
				message: 'Please insert a valid Youtube url.',
				type: 'error'
			});
	    }

		this.cancelVideoForm(evt);
	},

	cancelVideoForm: function(evt) {
		$('#form-edit-video').hide();
		$('#report-add-video').reset();
	},

	deleteVideo: function(evt, occurrence_id) {
		console.log('deleting');
		evt.preventDefault();

		var video_id = evt.target.rel;
		console.log("video " + video_id);
		console.log("occ " + occurrence_id);

		$.post(window.location.origin + '/hope/occurrences/remove_video/' + occurrence_id + '/', { 'video_id' : video_id }, 
			function(data) {
				$(evt.target).parent().remove();
				BarNotification.remove();
				BarNotification.init({
					message: 'Video successfully unlinked.',
					type: 'alert'
				});
			}
		);
	},


	/**
	 *
	 * callback function that triggers cancel edit on map, remove controls
	 *
	 **/
	cancelEdit: function(evt) {
		$('.default_operations').show();
		$('.location_controls').hide();
		$('.draw_controls').hide();
		this.model.trigger('cancelEdit');
		evt.preventDefault();
	},

	/**
	 *
	 * callback function that save geometries on backend, and remove controls
	 * from map,save method is on map view
	 *
	 **/
	confirmGeometry: function(evt) {
		$('.default_operations').show();
		$('.location_controls').hide();
		$('.draw_controls').hide();
		this.model.trigger('endEditGeo');
	},

	/**
	 *
	 * callback function that trigger map controls to edit geometry
	 *
	 **/
	editGeometry: function(evt) {
		$('.default_operations').hide();
		$('.location_controls').hide();
		$('.draw_controls').show();

		this.model.trigger('startEditGeo');
		BarNotification.init({
			message: 'You are on Map edit mode. Use Map controls buttons.',
			type: 'info'
		});

		evt.preventDefault();
	},


	editDetails: function(evt) {
		$("#selected-occurrence-content").hide();
		$('#form-edit-div').show();

		this.editMode = true;

		evt.preventDefault();
	},

	cancelEditDetails: function(evt) {
		$('#form-edit-div').hide();
		$("#selected-occurrence-content").show();
		this.reRenderForm();
		this.editMode = false;

		evt.preventDefault();
	},

	/**
	 *
	 * callback function that clear all geometries of the model
	 *
	 **/
	deleteGeometry: function(evt) {
		this.model.save({
			'destroy_shapes': true
		}).then(function() {
			BarNotification.remove();
			BarNotification.init({
				message: 'All shapes of this report were deleted.',
				type: 'alert'
			});
		});
		this.model.trigger('resetGeometry');
		evt.preventDefault();
	},


	/**
	 *
	 * callback function that triggers necessary controls on map
	 * to change occurrence location
	 *
	 **/
	changeLocation: function(evt) {
		console.log("triggering change position");
		$('.default_operations').hide();
		$('.location_controls').show();
		this.reRenderForm();
		this.model.trigger('changeLocation');
	},


	/**
	 *
	 * callback function that saves new coordinate to backend
	 *
	 **/
	confirmLocation: function(evt) {
		console.log("location confirmed");
		$('.location_controls').hide();
		$('.default_operations').show();

		var defaults = this.model.get('default_values');

		var startCoordinate = this.model.view.view.occurrencesMap.mapObj.center;
		var newCoordinates = startCoordinate.transform(this.model.view.view.occurrencesMap.mapObj.getProjectionObject(), this.model.view.view.occurrencesMap.projection);

		defaults['coordinate'] = newCoordinates.lat + ',' + newCoordinates.lon;

		this.model.set('default_values', defaults);

		var aux = this.model;

		// clear chapes
		this.model.save({
			'destroy_shapes': true
		});

		this.model.trigger('resetGeometry');
		this.model.trigger('confirmLocation');
		// reset shapes
		// save model
	},


	/**
	 *
	 * callback function that cancel location change
	 *
	 **/
	cancelLocation: function(evt) {
		//console.log("triggering cancelLocation");
		$('.location_controls').hide();
		$('.default_operations').show();
		this.model.trigger('cancelLocation');
	},


	/**
	 *
	 * delete occurrence on backend
	 *
	 **/

	deleteOccurrence: function() {
		if (!this.editMode) {
			var that = this;

			this.model.destroy({
				success: function(model, resp) {
					var obj = model.collection.filter(function(occ) {
						return occ.get('id') == model.id;
					});

					// if we have shapes in our map remove them
					/*if (that.model.view.view.occurrencesMap.layers.edit.features.length > 0)
						that.model.view.view.occurrencesMap.layers.edit.destroyFeatures();
					*/
					model.collection.remove(obj);
					model.destroyHook();

					BarNotification.remove();
					//BarNotification.init({message: 'Report Deleted', type: 'alert'});

					//console.log("[ReportView] Elemento eliminado");
					$("#edit-box").html('');

					window.reports_header_counter -= 1;
					$("#reports-header-counter").html(window.reports_header_counter);

					//that.model.view.view.occurrencesMap.clearMapMarkers();
					//that.model.view.view.occurrencesMap.recenterMap();

				}
			});
		}
	},

	promptDeleteOccurrence: function(evt) {

		evt.preventDefault();
		var that = this;

		bootbox.confirm("Are you sure you want to delete this Report ?", function(result) {
				if (result) {
					that.deleteOccurrence();
					$('.occ_class_search').removeClass('unnactivated');
					$('#occ_item_' + that.selectedReport).removeClass('activated');
					that.view.deleteOverlays();
				}
		});
	},


	/**
	 *
	 * callback function that save occurrence on backend
	 *
	 **/
	confirmOccurrence: function(evt) {
		console.log("Confirm Occurrence");
		var that = this;
		var $default_values = $('.default_values');
		var $schema_values = $('.schema_values');
		var def = this.model.get('default_values');
		obj_default = {};
		obj_schema = [];

		obj_coordinates = [];
		var selectedShape = this.drawingHandler.getSelectedShape();
		console.log("confirm selected shape:");
		console.log(selectedShape);

		/* getting values from form */
		_.each($default_values, function(el) {
			if (el.id == "title") {
				$("#report-main-title").html($(el).val())
			}
			def[el.id] = $(el).val();
		});

		_.each($schema_values, function(el) {
			obj = {
				'id': el.id,
				'name': el.name,
				'attribute_id': $(el).data('attrid'),
				'value': $(el).val()
			};
			obj_schema.push(obj);
		});

		//this.model.set('default_values', obj_default);
		this.model.set('schema_values', obj_schema);
		this.model.set('geom', selectedShape)
		if (selectedShape == false) {
			this.model.set('destroy_shapes', true);
		}

		console.log(this.model);

		var that = this;
		this.model.save().then(function() {
			that.model.view.view.occurrenceList.fetch({
				reset: true
			});
			that.reRenderContent();

		});

		this.editMode = true;

		$('#form-edit-div').hide();
		$("#selected-occurrence-content").show();

		if (evt != null) {
			return evt.preventDefault();
		}
	},

	/**
	 *	function that checks if all attributes are set
	 **/
	validateValues: function() {
		var attr = this.model.get('schema_values');

		for (var index in attr) {
			if (attr[index].value == '' || attr[index].value == undefined || attr[index].value == null) {
				return false;
			}
		}

		return true;

	},


	/**
	 *	callback function to publish report
	 *  . get default values object from model
	 *  . update validated attribute
	 *  . saves the model
	 **/
	validateOccurrence: function(evt) {

		if (this.validateValues()) {
			var defaults = this.model.get('default_values');
			defaults['validated'] = 1;
			this.model.set('default_values', defaults);

			var that = this;
			this.model.save().then(function() {
				that.model.view.view.occurrenceList.fetch({
					reset: true
				});
				BarNotification.remove();

			});

			//this.model.view.view.occurrenceList.fetch({reset: true});

			$('.publish_notice').hide();
			$('.validate_occurrence').hide();
			$('.unvalidate_occurrence').show();
		} else {
			BarNotification.init({
				message: 'Error: All fields are required to validate this report.',
				type: 'error'
			});
		}



		return evt.preventDefault();
	},

	/**
	 *	callback function to unpublish report
	 *  . get default values object from model
	 *  . update validated attribute
	 *  . saves the model
	 **/
	unvalidateOccurrence: function(evt) {

		var defaults = this.model.get('default_values');
		defaults['validated'] = 0;
		this.model.set('default_values', defaults);

		var that = this;
		this.model.save().then(function() {
			that.model.view.view.occurrenceList.fetch({
				reset: true
			});
			BarNotification.remove();
		});


		$('.publish_notice').show();
		$('.validate_occurrence').show();
		$('.unvalidate_occurrence').hide();



		return evt.preventDefault();
	},


	reRenderForm: function() {
		var form_div = $("#selected-occurrence-form");
		form_div.html('');

		if (this.model.schema) {

			var default_values = this.model.attributes.default_values;
			var schema_values = this.model.attributes.schema_values;

			form_div.append('<label>Title</label> <li class="input" style="margin-bottom:10px;"><input class="default_values" id="title" name="title" type="text" value="' + default_values.title + '"" /></li>');
			form_div.append('<label>Description</label><li class="input" style="margin-bottom:10px;"><textarea class="default_values" id="description" name="description" placeholder="Insert description" rows="6" >' + default_values.description + '</textarea></li>');

			for (var i = 0; i < schema_values.length; i++) {

				form_div.append('<label>' + schema_values[i].name + '</label><li class="input" style="margin-bottom:10px;"><input class="schema_values" id="' + schema_values[i].id + '" data-attrid="' + schema_values[i].attribute_id + '" name="' + schema_values[i].name + '" data-type="text" value="' + schema_values[i].value + '" type="text" /></li>');

			}
		}
	},

	reRenderContent: function() {
		var content_div = $("#selected-occurrence-content");
		content_div.html('');
		if (this.model.schema) {

			/* attributes object properties - name, readable, type */

			var default_values = this.model.attributes.default_values;
			var schema_values = this.model.attributes.schema_values;


			//console.log(default_values);

			content_div.append('<div class="span6"><strong>Title</strong><p>' + default_values.title + '</p></div>');
			content_div.append('<div class="span6" style="margin-left:0px;"><strong>Category</strong><p>' + default_values.Category + '</p></div>');
			content_div.append('<div class="span12" style="margin-left:0px;"><strong>Description</strong><p>' + default_values.description + '</p></div>');

			for (var i = 0; i < schema_values.length; i++) {
				content_div.append('<div class="span12" style="margin-left:0px;"><strong>' + schema_values[i].name + '</strong><p>' + schema_values[i].value + '</p></div>');
			}
		}

		//BarNotification.init({message: 'Report Updated', type: 'success'});
	},



	/**
	 *
	 *	helper function to render form with attributes
	 *
	 **/
	renderForm: function() {

		// if we have permission render the form
		if (this.model.get('default_values')['permission'] == 1) {

			var form_div = $("#selected-occurrence-form");

			if (this.model.schema) {

				var default_values = this.model.attributes.default_values;
				var schema_values = this.model.attributes.schema_values;

				form_div.append('<label>Title</label> <li class="input" style="margin-bottom:10px;"><input class="default_values" id="title" name="title" type="text" value="' + default_values.title + '"" /></li>');
				form_div.append('<label>Description</label><li class="input" style="margin-bottom:10px;"><textarea class="default_values" id="description" name="description" placeholder="Insert description" rows="6" >' + default_values.description + '</textarea></li>');

				for (var i = 0; i < schema_values.length; i++) {

					form_div.append('<label>' + schema_values[i].name + '</label><li class="input" style="margin-bottom:10px;"><input class="schema_values" id="' + schema_values[i].id + '" data-attrid="' + schema_values[i].attribute_id + '" name="' + schema_values[i].name + '" data-type="text" value="' + schema_values[i].value + '" type="text" /></li>');

				}
			}
		}


		var content_div = $("#selected-occurrence-content");
		if (this.model.schema) {

			/* attributes object properties - name, readable, type */

			var default_values = this.model.attributes.default_values;
			var schema_values = this.model.attributes.schema_values;


			//console.log(default_values);

			content_div.append('<div class="span6"><strong>Title</strong><p>' + default_values.title + '</p></div>');
			content_div.append('<div class="span6" style="margin-left:0px;"><strong>Category</strong><p>' + default_values.Category + '</p></div>');
			content_div.append('<div class="span12" style="margin-left:0px;"><strong>Description</strong><p>' + default_values.description + '</p></div>');

			for (var i = 0; i < schema_values.length; i++) {
				content_div.append('<div class="span12" style="margin-left:0px;"><strong>' + schema_values[i].name + '</strong><p>' + schema_values[i].value + '</p></div>');
			}
		}
	},


	/**
	 *
	 *	helper function to render gallery template
	 *
	 **/
	renderGallery: function() {
		// initialize dropzone for file upload
		$("#report-upload-dropzone").dropzone({
			url: "/hope/occurrences/upload/" + this.model.id + "/",
			acceptedFiles: 'image/*'
		});

		var photos = this.model.get('photos');
		var permission = this.model.get('default_values')['permission'];

		if (photos.length > 0) {
			for (p in photos) {
				if (parseInt(permission) == 1)
					$("#occ-photos").append("<li class='span4' style='margin-left:0px;margin-right:7px;margin-bottom:7px;max-width:100px;text-align:center'><a href='" + photos[p].path_big + "' target='_blank' class='thumbnail'><img data-src='" + photos[p].path_small + "' src='" + photos[p].path_small + "'></a><a href='#' class='reportPhotoDelete' rel='" + photos[p].id + "'>Delete</a></li>");
				else
					$("#occ-photos").append("<li class='span4' style='margin-left:0px;margin-right:7px;margin-bottom:7px;max-width:100px;text-align:center'><a href='" + photos[p].path_big + "' target='_blank' class='thumbnail'><img data-src='" + photos[p].path_small + "' src='" + photos[p].path_small + "'></a></li>");
				//$("#thumbs").append("<a target='_blank' href='" + photos[p].path_medium + "'><img src='" + photos[p].path_small + "'/></a>");
			}
		}

		var that = this;
		$('.reportPhotoDelete').on('click', function(evt) {
			evt.preventDefault();

			bootbox.confirm("Are you sure you want to delete this photo?", function(result) {
				if (result)
					that.removePhoto(evt);
			});

		});


	},

	renderFeed: function() {

		$.get('/hope/feed/report/' + this.model.get('_id') + '/0/10', function(data) {
			if(data.length > 0) {
				
				//console.log("RENDERING REPORT FEED");

				var $report_feed_container = $('#report-feed-container');	
				$report_feed_container = $('#report-feed-container').html('');	

				for(var feed in data) {

					var tmpl = _.template($('#report_feed').html(), {feed: data[feed]});
					$report_feed_container.append(tmpl);
					//console.log(data[feed]);
				}
			}
		});	
	},

	renderVideos: function() {

		var videos = this.model.get('videos');
		var permission = this.model.get('default_values')['permission'];
		var occurrence_id = this.model.get('default_values')['id'];

		if (videos.length > 0) {
			for(v in videos) {

			    
				console.log(videos[v].url);
				video_id = videos[v].url.split('v=')[1];
				ampersandPosition = video_id.indexOf('&');
				if(ampersandPosition != -1) {
				  video_id = video_id.substring(0, ampersandPosition);
				}

				if (parseInt(permission) == 1)
					$("#occ-videos").append("<li class='span4' style='margin-left:0px;margin-right:7px;margin-bottom:7px;max-width:100px;text-align:center'><a href='#' class='thumbnail video_start' data-id='" + video_id + "'><img data-id='" + video_id + "' data-src='http://img.youtube.com/vi/" + video_id + "/1.jpg' src='http://img.youtube.com/vi/" + video_id + "/1.jpg'></a><a href='#' class='report_video_delete' rel='" + videos[v].id + "'>Delete</a></li>");
				else
					$("#occ-videos").append("<li class='span4' style='margin-left:0px;margin-right:7px;margin-bottom:7px;max-width:100px;text-align:center'><a href='#' class='thumbnail video_start' data-id='" + video_id + "''><img data-id='" + video_id + "' data-src='http://img.youtube.com/vi/" + video_id + "/1.jpg' src='http://img.youtube.com/vi/" + video_id + "/1.jpg'></a>");
			}

			$('.video_start').off();
			$('.video_start').on('click', function(evt){
				vid = $(evt.target).data('id');
				$('#ytplayer').attr('src', 'http://www.youtube.com/embed/' + vid + '?autoplay=1&origin=http://example.com')
				evt.preventDefault();
			});

			var that = this;
			$('.report_video_delete').on('click', function(evt) {
				evt.preventDefault();

				bootbox.confirm("Are you sure you want to unlink this video?", function(result) {
					if (result)
						that.deleteVideo(evt, occurrence_id);
				});
			});
		}
	},

	removePhoto: function(evt) {
		$.get(window.location.origin + '/hope/occurrences/remove_photo/' + evt.target.rel, function(data) {
			$(evt.target).parent().remove();
			BarNotification.remove();
			BarNotification.init({
				message: 'Photo successfully deleted.',
				type: 'alert'
			});
		});
	},

	/**
	 *
	 *	render all
	 *
	 **/
	render: function() {

		var total_photos = this.model.get('photos').length;
		var validated = this.model.get('default_values')['validated'];
		var user_name = this.model.get('default_values')['user_name'];
		var date = this.model.get('default_values')['created_at'];
		var follow = this.model.get('default_values')['vote_counter'];
		var permission = this.model.get('default_values')['permission'];
		var report_name = this.model.get('default_values')['title'];
		var user_id = this.model.get('default_values')['user_id'];

		var tmpl = _.template($('#occurrence_editor').html(), {
			'title': report_name,
			id: this.model.get('_id'),
			total_photos: total_photos,
			'validated': validated,
			'user_name': user_name,
			'date': date,
			'followers': follow,
			'permission': permission,
			'user_id': user_id
		});
		$(this.el).show();
		$(this.el).html(tmpl);

		this.renderForm();
		this.renderGallery();
		this.renderFeed();
		this.renderVideos();

		BarNotification.remove();

		var fb_width = $("#edit-box").width() - 30;
		$("#edit-box").append('<div class="row-fluid"><div class="span9"><div class="fb-comments" data-href="http://testeteste.pt/hope/#map/' + this.model.get('_id') + '" data-width="' + fb_width + '"></div></div></div>');
		FB.XFBML.parse(document.getElementById('edit-box'));

		//console.log("--------- LOADED MODEL -------------");
		//console.log(this.model);
		$("#edit-box").show();

		//$("[rel='tooltip']").tooltip({placement:'top'});
	},

	/**
	 *
	 * CREATE MODAL VIEW, TODO CREATE SEPARATE VIEW
	 *
	 **/

	createModal: function(evt) {
		//console.log('creating followers modal view');
		this.followersModal = new FollowersModalView({
			view: this,
			model: this.model,
			page: '#modal_div_report'
		});

		evt.preventDefault();

	}


});
