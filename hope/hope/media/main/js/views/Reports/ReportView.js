/*
|--------------------------------------------------------------------------
| ReportView
|--------------------------------------------------------------------------
| 'Front Controller' to #report view
| View responsible for object creation with map shape editing 
| features.
| 
*/

var ReportView = Backbone.View.extend({

	/**
	 *
	 * el: 			report-page is the div#id
	 * template: 	#report-page-template, find it in templates/templates-report.html.
	 *
	 **/
	events: {
		//'click #new_occurrence_btn': 'createNewOccurrence',
		'click .sort_d': 'sortCollection',
		'click .sort_n': 'sortCollection',
		//'click .tocc_item': 'onSelectedReport',
		'click #close_btn': 'closeBtn',
		'click .report_child_class': 'onChildSelect'
	},

	loaded: false,
	editMode: false,

	el: $("#page"),
	serverURL: window.location.origin,
	selectedReport: null,
	markerCluster: null,
	currentOccurrence: null,
	map: null,
	markers: null,
	bounds: null,
	currentLocation: null,

	/**
	 *
	 *	nothing special goes here, just binding events
	 *
	 **/
	initialize: function() {
		_.bindAll(this, 'load', 'closeBtn', 'unload','toggleCluster', 'isLoaded', 'hide', 'show', 'cleanView', 'initHook', 'exitHook', 'fillSelectBox', 'createNewOccurrence', 'renderOccurrenceList', 'sortCollection', 'onSelectedReport');
		this.el = $("#ocurrence-box");
		this.app = this.options.app;
		//console.log(this.app);
		this.render();
		this.delegateEvents();
	},

	reopen: function() {
		//console.log('reopen');
		if (this.loaded) {
			this.occurrenceList.fetch({
				reset: true
			});
		}
	},

	closeBtn: function() {
		$("#edit-box").hide();
		
		this.resetMaps();

		$('.occ_class_search').removeClass('unnactivated');
		$('#occ_item_' + this.selectedReport).removeClass('activated');

		if (this.selectedReport != null) {
			this.selectedReport = null;
		} 
	
		if (this.currentOccurrence != null) {
			this.cleanView(this.currentOccurrence);
		}
		
		this.occurrenceList.fetch({
			reset: true
		});
	},

	onChildSelect: function(evt) {
		// SHOW CHILD DETAILS
		//console.log("[ReportView] Child Selected");

		var child_btn = evt.currentTarget;
		var cat_id = $(child_btn).attr("id");
		//console.log(cat_id);
		//this.categorySelected = cat_id;

		$("#chzn_new_occurrence").val("" + cat_id).trigger("change");
	},

	/**
	 *
	 *	function that's triggered when click sorting by something
	 *
	 **/
	sortCollection: function(evt) {
		//console.log("inside sort collection");
		if (evt.target.classList[0]) {
			if (evt.target.classList[0] === "sort_d") {
				this.occurrenceList.comparator = function(occurrence) {
					return occurrence.get('geo')['start'].distance;
				}
				this.sortByDistance = true;

			} else if (evt.target.classList[0] === "sort_n") {
				this.occurrenceList.comparator = function(occurrence) {
					return occurrence.get('name');
				}
				this.sortByDistance = false;
			}
			this.occurrenceList.sort();
		}
		evt.preventDefault();
	},

	toggleCluster: function() {
		var that = this;

		if ($("#hide-cluster-btn").hasClass("hidding_cluster")) {
			that.markerCluster.setMaxZoom(15);
			$("#hide-cluster-btn").html("<i class='icon-cog'></i> Hide Cluster");
			$("#hide-cluster-btn").removeClass("hidding_cluster")
		} else {
			that.markerCluster.setMaxZoom(0);
			$("#hide-cluster-btn").html("<i class='icon-cog'></i> Show Cluster");
			$("#hide-cluster-btn").addClass("hidding_cluster")
		}
		
	},

	initMaps: function() {
		
		var that = this;

		var stylez = [
			{
				featureType: "all",
				elementType: "all",
				stylers: [
					{ saturation: -100 } // <-- THIS
				]
			}
		];

		that.currentLocation = new google.maps.LatLng(40.20000, -8.41667);

		var mapOptions = {
			zoom: 15,
			center: that.currentLocation,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'tehgrayz']
			}
		};

		that.map = new google.maps.Map(document.getElementById('toc_map'), mapOptions);

		var mapType = new google.maps.StyledMapType(stylez, {
			name: "Grayscale"
		});

		that.map.mapTypes.set('tehgrayz', mapType);
		that.map.setMapTypeId('tehgrayz');
	},

	deleteOverlays: function() {
		for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(null);
		};
		this.markers.length = 0;
		this.bounds = new google.maps.LatLngBounds();
	},

	resetMaps: function() {
		if (this.map == null) {
			this.initMaps();
		}
		
		if (this.markerCluster != null) {
			this.markerCluster.clearMarkers();
		}

		if (this.markers != null) {
			for (var i = 0; i < this.markers.length; i++) {
				this.markers[i].setMap(null);
			};
			this.markers.length = 0;
		} else {
			this.markers = [];
		}
	
		this.bounds = new google.maps.LatLngBounds();
		this.bounds.extend(new google.maps.LatLng(40.20000, -8.41667));
		this.map.fitBounds(this.bounds);
		this.map.setZoom(12);
	},

	/**
	 *
	 *	Load function, here we create the skeleton template
	 *  for ReportView and create the handlers for its functionallity
	 *  we load this view creating the necessary collections and subviews and
	 *  adding event listeners.
	 *
	 **/
	load: function(options) {

		if (!this.isLoaded()) {
			//console.log($("#map_toc_container").width());

			var that = this;
			this.renderReportTemplate();
			
			//$("#map_toc_container").width($("#map_toc_container").width() - 10)

			// collections needed
			this.categoryList = new CategoryList();
			this.occurrenceList = new UserOccurrenceList();
			// map instance
			this.initMaps();


			//this.occurrencesMap = new TOcMapView({view: this});
			this.occurrenceList.view = this;

			// events
			this.categoryList.on('reset', this.fillSelectBox);
			this.occurrenceList.on('reset', this.renderOccurrenceList, this);
			this.occurrenceList.on('add', this.renderOccurrenceList, this);
			this.occurrenceList.on('remove', this.renderOccurrenceList, this);
			this.occurrenceList.on('change', this.renderOccurrenceList, this);

			// let's get the collection data from backend
			this.categoryList.fetch({
				reset: true
			});
			this.occurrenceList.fetch({
				reset: true
			});

			this.sortByDistance = true;
		}
		this.loaded = true;
	},

	changeCategory: function(evt) {
		var cat_id = evt.currentTarget.value;

		//console.log(cat_id);
		if (cat_id != undefined) {
			$.post(this.serverURL + "/hope/categories/schema/" + cat_id + "/", {
				csrfmiddlewaretoken: $.cookie('csrftoken')
			}, function(data) {
				var parents = data.parents;
				var parents_text = "";

				for (var i = parents.length - 1; i >= 0; i--) {
					parents_text += "<a class='report_child_class' id='" + parents[i].id + "'>" + parents[i].name + "</a> <i class='icon-angle-right'></i> ";
				}

				parents_text += "" + $("#chzn_new_occurrence :selected").text();

				$("#report_cat_hier").html(parents_text);

			}, "json");

			$.post(this.serverURL + "/hope/categories/childs/" + cat_id + "/", {
				csrfmiddlewaretoken: $.cookie('csrftoken')
			}, function(data) {
				//console.log("[ManageView] Get category childs.");
				var template_childs = "";
				var res = $.parseJSON(data)
				for (var i = 0; i < res.length; i++) {
					template_childs += "<li><a id='" + res[i].pk + "' value='" + res[i].fields.menu_label + "' class='report_child_class'>" + res[i].fields.order + " -  " + res[i].fields.menu_label + "</a></li>";
				}
				$("#report_box_childs").html(template_childs);
			});
		}
	},

	/**
	 *
	 * Renders the skeleton template, it appends it to page div
	 *
	 **/
	renderReportTemplate: function() {
		var page = _.template($("#report-page-template").html());
		$("#page").append(page);

		var formTemplate = _.template($("#new-occurrence-form").html());
		$("#form-container").html(formTemplate);
		//$(".category_list").select2();

		var that = this;

		$("#new_occurrence_btn").on('click', function(evt) {
			that.createNewOccurrence(evt);
		});

		$("#chzn_new_occurrence").on('change', function(evt) {
			that.changeCategory(evt);
		});

		/*$(".sort_n").on('click', function(evt) {
			that.sortCollection(evt);
		});*/
	},

	/**
	 *
	 * Callback function triggered when we select a report from the list
	 * just loads the occurrence
	 *
	 **/
	onSelectedReport: function(evt) {
		//var id = $(evt.currentTarget).attr("rel");
		//this.app.navigate('report', true);
	},

	/**
	 *

	 * Adds the dynammically categories list to
	 * select option
	 *
	 **/
	fillSelectBox: function() {
		var elm = $('#chzn_new_occurrence');
		elm.html('');
		var cur_id = this.options.id;
		//console.log(this.categoryList);

		this.categoryList.each(function(cat) {
			var curr_name = cat.attributes.fields.menu_label;
			if (parseInt(cat.attributes.fields['bullshit']) == 0) {
				var id = cat.attributes.pk;
				elm.append('<option value="' + id + '" ' + ((curr_name === 'INFRA-ESTRUTURAS URBANAS') ? 'selected' : '') + '>' + cat.attributes.fields.menu_label + '</option>');
			}

		});

		elm.select2();
	},

	createCluster: function() {
		var that = this;
		that.markerCluster = new MarkerClusterer(that.map, that.markers);
		that.markerCluster.setMaxZoom(15);
		that.map.fitBounds(that.bounds);
	},

	/**
	 *
	 * renders a single occurrence item, called by
	 * renderOccurrenceList
	 *
	 **/
	addOne: function(obj) {
		var that = this;
		var domID = 'occ_item_' + obj.get('id');
		
		if (this.selectedReport == null) {
			var coordinates = obj.get('coordinate').split(",");

			var mapLatlng = new google.maps.LatLng(coordinates[0], coordinates[1]);

			var marker = new google.maps.Marker({
				position: mapLatlng,
				map: that.map,
				draggable: false,
				title: obj.get('title'),
				icon: "https://dl.dropboxusercontent.com/u/5427257/spero-ico.png"
			});

			marker.marker_id = obj.get('id');

			google.maps.event.addListener(marker, 'click', function() {
				window.location.href = "#report/"+marker.marker_id;
			});

			that.markers.push(marker);
			that.bounds.extend(mapLatlng);
		}
		//that.map.fitBounds(that.bounds);

		var tmpl = _.template($('#occurrences_item').html(), {
			id: obj.get('id'),
			name: obj.get('title'),
			domID: domID,
			description: obj.get('description'),
			validated: obj.get('validated'),
			category_name: obj.get('category_name'),
			created_at: obj.get('created_at'),
			vote_counter: obj.get('vote_counter'),
			is_owner: obj.get('is_owner'),
			permission: obj.get('permission')
		});
		$("#occurrence-box-list").prepend(tmpl);

		$("#" + domID).on('click', function(evt) {
			that.onSelectedReport(evt);
			that.selectedReport = $(evt.target).data('occ_id');
			//console.log(that.selectedReport);
			evt.preventDefault();
		});
	},

	/**
	 *
	 * renders a the dinammicaly fetched occurrenceList
	 *
	 **/
	renderOccurrenceList: function() {
		//console.log("[ReportView] rendering occurrence list");
		
		if(this.occurrenceList.length > 0) {
			$("#occurrence-box-list").html('');
		}

		this.occurrenceList.each(this.addOne, this);
		this.createCluster();
		/*this.map.fitBounds(this.bounds);*/


		$(".avatar").tooltip();
		$(".timestamps").cuteTime();

		//console.log(this.occurrenceList);

		// TODO : MAKE IT REUSABLE
		$("#quick-search-occ").keyup(function() {
			var e = $(this).val(),
				t = 0,
				n = 0;
			$(".occ_class_search").each(function() {
				if ($(this).text().search(new RegExp(e, "i")) < 0) {
					$(this).hide()
				} else {
					$(this).show();
					t++
				}
			})
		});

		if (this.selectedReport != null) {
			$('.occ_class_search').addClass('unnactivated');
			$('#occ_item_' + this.selectedReport).removeClass('unnactivated');
			$('#occ_item_' + this.selectedReport).addClass('activated');
		}


		BarNotification.remove();

	},

	/**
	 *
	 * this function is a callback function triggered
	 * by the click event of new occurrence button
	 *
	 **/
	createNewOccurrence: function(evt) {
		//console.log("[ReportView] creating new occurrence");
		var category = $('#chzn_new_occurrence').val();

		// for now, get the center of the map in the screen
		var startCoordinate = this.currentLocation;

		// tem de ter uma categoria escolhida
		if (category != undefined) {
			var tmpOccurrence = new TemporaryOccurrence();

			var that = this;
			tmpOccurrence.view = this;

			//console.log("!--- CREATING");
			//console.log(startCoordinate);

			tmpOccurrence.save({
				geo: {
					start: {
						latitude: startCoordinate.lat(),
						longitude: startCoordinate.lng(),
						distance: 0
					}
				},
				"category_id": category,
				"id": 0
			}, {
				success: function(model, resp) {
					that.loadOccurrence(model.get('id'));
					that.occurrenceList.add(model);
					BarNotification.remove();
					BarNotification.init({
						message: 'New report created!',
						type: 'success'
					});

					window.reports_header_counter += 1;
					$("#reports-header-counter").html(window.reports_header_counter);

				},
				silent: true
			});

			// actualizar a lista de ocorrencias
			//this.occurrenceList.fetch();

		}
		return false;
	},

	loadOccurrence: function(id) {
		//app.log('loading ' + id);
		this.resetMaps();

		if (this.currentOccurrence != null) {
			this.cleanView(this.currentOccurrence);
		}

		if (id > 0) {

			this.currentOccurrence = new ReportFormView({
				model_id: id, //obj[0], 
				el: $('#edit-box'),
				collection: this.occurrenceList,
				view: this,
				map: this.map
			});

			app.log('changing map occurrence');
			//this.options.view.occurrencesMap.changeOccurrence(obj[0]);
			this.selectedReport = id;

		}
	},

	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
		element.resetDrawing();
	},

	render: function() {
		//creates the form template skeleton


		//this.renderOccurrenceList();

		//fill the select box with categories
		//this.fillSelectBox();

	},

	/* --- HELPERS --- */
	hide: function() {
		$("#report-page").hide();
	},

	show: function() {
		$("#report-page").show();
	},

	initHook: function(options) {
		//console.log('[ReportView] Initting ReportView');
		var that = this;

		if (!this.isLoaded) {
			this.load();
		}

		/* if we have rid on hash, load the occurrence */
		if (options != undefined) {
			this.selectedReport = options.rid;
			this.loadOccurrence(options.rid);
		} 

		$('#report-menu-button').removeClass('btn-default');
		$('#report-menu-button').addClass('btn-blue');

	},

	exitHook: function() {
		console.log("exit hook");
		$('#report-menu-button').removeClass('btn-blue');
		$('#report-menu-button').addClass('btn-default');
		if (this.currentOccurrence != null) {
			this.cleanView(this.currentOccurrence);
		}
		$("#edit-box").hide();
	},

	unload: function() {
		this.loaded = false;
	},

	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */

});


/*
|--------------------------------------------------------------------------
| FollowersModalView
|--------------------------------------------------------------------------
| This view generates the modal window that controls the report followers 
| permissions
| 
*/
var FollowersModalView = Backbone.View.extend({

	events: {
		'click .teste': 'teste',
		'click .teste2': 'teste'
	},

	el: $("#followers_modal"),

	initialize: function(options) {
		_.bindAll(this);

		this.model = options.model;
		this.page = options.page;

		//console.log('created');
		//console.log('model inside modal::');
		//console.log(this.model);

		this.followersList = new FollowersList({
			occ_id: this.model.get('_id')
		});
		var that = this;

		this.followersList.fetch({
			success: function(model, resp) {
				that.render();
			}
		});
	},

	teste: function(evt) {
		//console.log('----------------------DEEUUEUEUEUEUE-----------------------');
	},


	givePermission: function(evt) {
		//console.log('allowing');

		var el = $(evt.target);
		el.hide()
		$(".dontallow-id-" + evt.target.rel).show();


		evt.preventDefault();
	},

	deletePermission: function(evt) {
		//console.log('disallowing');

		var el = $(evt.target);
		el.hide()
		$(".allow-id-" + evt.target.rel).show();

		$.get('/hope/occurrences/update_permission/' + this.model.get('_id') + '/0/' + evt.target.rel);

		evt.preventDefault();
	},

	followUser: function(evt) {
		evt.preventDefault();

		$.get('/hope/users/follow/' + evt.target.rel);

		$(evt.target).hide();

		hopeuser.addFollowing(evt.target.rel);
		$('#following-header-counter').html(hopeuser.get('following').length);

		var parent = $(evt.target).parent().find('.unfollow_modal_button');
		parent.show();

	},

	unfollowUser: function(evt) {
		evt.preventDefault();
		$.get('/hope/users/unfollow/' + evt.target.rel);
		$(evt.target).hide();

		hopeuser.removeFollowing(evt.target.rel);
		$('#following-header-counter').html(hopeuser.get('following').length);

		var parent = $(evt.target).parent().find('.follow_modal_button');
		parent.show();
	},

	render: function() {
		var followers = this.followersList.get('followers');
		var users_followed = this.followersList.get('users_followed');

		if (followers != undefined) {

			var tmpl = _.template($('#modal_follow').html(), {
				'followers': followers,
				'users_followed': users_followed,
				'permission': this.model.get('default_values')['permission']
			});

			$('.modal_div_report').html(tmpl);

			$('.allow').on('click', this.givePermission);
			$('.dontallow').on('click', this.deletePermission);
			$('.follow_modal_button').on('click', this.followUser);
			$('.unfollow_modal_button').on('click', this.unfollowUser);


			this.delegateEvents();
			$('#followers_modal').modal('show');
			BarNotification.remove();


		} else {
			BarNotification.init({
				message: 'This report has no followers',
				type: 'alert'
			});
		}

	}
});

