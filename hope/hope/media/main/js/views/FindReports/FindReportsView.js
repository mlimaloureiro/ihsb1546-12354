/*
|--------------------------------------------------------------------------
| FindReportsView
|--------------------------------------------------------------------------
|
| 'Front Controller' to #map view. It's the parent view that creates
|  the GMapHandler View to display content on map, the FeatureDialog 
|  view that displays a selected element data, and the operationMapView
|  that allows to search elements
|
*/
var FindReportsView = Backbone.View.extend({
	loaded: false,
	el: "#search-page",
	template: "#search-page-template",
	serverURL: window.location.origin,
	map: null,
	markers: null,
	bounds: null,
	currentLocation: null,

	initialize: function() {
		_.bindAll(this, 'resizeMap', 'load', 'unload', 'isLoaded', 'hide', 'show', 'exitHook', 'initHook');
	},

	resizeMap: function() {
		//console.log("Resizing Map");
		
		/*this.mapHandler.mapObj.updateSize();
		$("div#map-middle-center").height($('body').innerHeight() - $('div#header').innerHeight());
		this.mapHandler.mapObj.updateSize();*/
	},

	load: function() {

		if (!this.isLoaded()) {

			this.renderSearchTemplate();

			if (!this.mapHandler) {
				// create table instance
				$.extend( $.fn.dataTableExt.oStdClasses, {"sWrapper": "dataTables_wrapper form-inline"});

				var that = this;

				//console.log($("#results_container").width());
				//$("#results_container").width($("#results_container").width() - 10)

				this.occurrencesTable = $('#occurrences-table').dataTable({
				    "bJQueryUI": false,
				    "bAutoWidth": false,
				    "sPaginationType": "full_numbers",
				    "sDom": "<\"table-header\"fl>t<\"table-footer\"ip>",
				    "oTableTools": {
				    	'sRowSelect' : 'single'
				    },
				    fnDrawCallback: function( oSettings ) {

						$el = $("#occurrences-table tbody tr");
		                $el.off();
                        $el.on('click',function(evt) {
                        	var position = that.occurrencesTable.fnGetPosition(this); // getting the clicked row position
                        	var id = that.occurrencesTable.fnGetData(position)[0];
    						var coords = that.occurrencesTable.fnGetData(position)[2];
    						that.mapHandler.showSingle(coords);
    						that.mapHandler.trigger('selectFeature',id);

    						//console.log(id); 
                        });
                    }
				  });

				if ((typeof google) == 'undefined') {
					this.mapHandler = new MapHandler({occTable : this.occurrencesTable});
				} else {
					this.mapHandler = new GmapHandler({occTable : this.occurrencesTable});
				}
			}	

			this.mapHandler.load();

			if (!this.operationView)
				this.operationView = new OperationMapView({
					mapHandler: this.mapHandler
				});

			if (!this.featureDialog)
				this.featureDialog = new FeatureDialog({
					mapHandler: this.mapHandler,
				});
			this.featureDialog.load();

			this.loaded = true;
		}
	},

	renderSearchTemplate: function() {
		//console.log("render search page");
		var page = _.template($(this.template).html());
		$("#page").append(page);

		this.rendered = true;
	},

	unload: function() {
		this.loaded = false;
		//this.categoriesDialog.unload();
		//this.featureDialog.unload();
		//this.mapHandler.unload();
	},

	isLoaded: function() {
		return this.loaded;
	},

	hide: function() {
		$("#search-page").hide();
		if (this.featureDialog) this.featureDialog.hide();
		if (this.optionsDialog) this.optionsDialog.hide();
	},

	show: function() {
		$("#search-page").show();

		if (this.featureDialog) this.featureDialog.show();
		if (this.optionsDialog) this.optionsDialog.show();
	},

	exitHook: function() {
		this.options.app.log('Exiting EditorView');
		$('#find-menu-button').removeClass('btn-blue');
		$('#find-menu-button').addClass('btn-default');
	},

	initHook: function() {
		this.options.app.log('Initing EditorView');

		this.operationView.topReportsLoaded = false;
		this.operationView.renderFeed();

		$('#find-menu-button').removeClass('btn-default');
		$('#find-menu-button').addClass('btn-blue');

		this.resizeMap();
	}
});



/*
|--------------------------------------------------------------------------
| Operation Map View
|--------------------------------------------------------------------------
|
| description
|
*/
var OperationMapView = Backbone.View.extend({
	id: 'operations_container',
	categoryList: new CategoryList(),
	el: $("#page"),
	serverURL: window.location.origin,
	topReportsLoaded: false,
	newReportsLoaded: false,



	initialize: function() {
		var that = this;
		/* Log cateogry list */
		//this.categoryList = new CategoryList(null,{scope: 1});	
		//console.log(this.categoryList);

		_.bindAll(this,'onCategorySelect', 'closeBtn');

		this.mapHandler = this.options.mapHandler;

		this.categoryList.fetch().then(function() {
			that.categoryList;
			var categoriesTree = that.buildSingle(that.categoryList.models);
			that.render(categoriesTree);
		});

		/* display all occurrences */ 
		this.mapHandler.updateCategories(0);
	},

	events: {
		'change #category-sz': 'onCategorySelect',
		'click .child_editor_class':'onChildSelect',
		'click #editor_close_btn': 'closeBtn'
	},

	render: function(categories) {
		var template = _.template($("#operations-action-search").html(), {
			cat: categories
		});
		$("#" + this.id).html(template);

		$('.category-select').select2();

		//needs to send an object with reference to this view	
		$("select.category-select").on('change', {
			mapHandler: this.options.mapHandler,
			cat: categories
		}, this.onCategorySelect);

		this.delegateEvents();
		this.renderFeed();

		return this;
	},

	closeBtn: function() {
		$("#element-specs").hide();
		this.mapHandler.deleteOverlays();
		//this.mapHandler.recenterMap();
		$(".sidebar_top_report_trigger").removeClass('activated');
		$(".sidebar_latest_report_trigger").removeClass('activated');
		$(".sidebar_latest_report_trigger").removeClass('unnactivated');
		$(".sidebar_top_report_trigger").removeClass('unnactivated');

		cat = this.categorySelected != undefined ? this.categorySelected : 0;

		this.mapHandler.updateCategories(cat);

	},


	renderFeed: function() {
		var that = this;

		if(this.categorySelected == undefined) {
			cat = 0
		} else {
			cat = this.categorySelected;
		}

		$('#top_reports_load').off();

		$.get('/hope/occurrences/latest/1/' + cat, function(data) {
			hopeLatestReports = data;
			var template = _.template($("#sidebar-feed").html(), {reports: hopeLatestReports.result});
			$("#feed_container").html(template);

			$(".timestamps").cuteTime();

			that.newReportsLoaded = true;

			BarNotification.remove();


			$(".sidebar_latest_report_trigger").on('click', function(evt) {
				evt.preventDefault();

				occ_id = $(evt.target).data('rel');


				if(occ_id == undefined) {
					var el = $(evt.target).closest('.sidebar_latest_report_trigger');
					occ_id = el.data('rel');
				}


				that.mapHandler.trigger('selectFeature',occ_id);
				coordsObj = _.find(hopeLatestReports.result, function(index) {return index.id == occ_id});
				that.mapHandler.showSingle(coordsObj.coordinate);
				BarNotification.remove();
				$("#element-specs").show();

			});
 

			$('#top_reports_load').on('click', function() {
				//console.log('rendering top');


				$.get('/hope/occurrences/top/1/' + cat, function(data) {
					hopeTopReports = data;
					//console.log(data.result);
					var template = _.template($("#top-reports-sidebar").html(), {reports: hopeTopReports.result});
					$("#top_reports").html(template);

					$(".timestamps").cuteTime();

					that.topReportsLoaded = true;


					BarNotification.remove();

					$(".sidebar_top_report_trigger").off();
					$(".sidebar_top_report_trigger").on('click', function(evt) {

						evt.preventDefault();

						occ_id = $(evt.target).data('rel');
						console.log($(evt.target).data());


						if(occ_id == undefined) {
							var el = $(evt.target).closest('.sidebar_top_report_trigger');
							occ_id = el.data('rel');
						}


						that.mapHandler.trigger('selectFeature', occ_id);
						
						console.log("top results:");
						console.log(hopeTopReports.result);
						console.log(occ_id);

						coordsObj = _.find(hopeTopReports.result, function(index) {return index.id == occ_id});
						that.mapHandler.showSingle(coordsObj.coordinate);
						BarNotification.remove();

					});
				});
				
			});

		});
	},

	renderMoreTop: function() {
		//console.log('rendertop');
	},

	renderMoreFeed: function() {

	},


	/**
	 *
	 * buildTree creates the Hierarchical elements model
	 * and returns a tree structure to be used on category
	 * selection
	 *
	 **/
	buildTree: function(data, parent) {
		var initialData = data;
		var tree = [];

		var i = 0;
		for (var i = 0; i < initialData.length; i++) {
			if ((initialData[i].attributes.parent != null && initialData[i].attributes.parent['$oid'] == parent) ||
				(parent == null && initialData[i].attributes.parent == null)) {

				obj = {
					attr: {
						"id": initialData[i].attributes['_id']['$oid']
					},
					data: initialData[i].attributes.name,
					//id: initialData[i].attributes['_id']['$oid'],
					children: this.buildTree(initialData, initialData[i].attributes['_id']['$oid'])
				}
				tree.push(obj);
			}
		}
		return tree;
	},

	/**
	 *
	 * single elements model
	 *
	 **/
	buildSingle: function(data) {
		var initialData = data;
		var tree = [];

		//console.log(data);

		var i = 0;
		for (var i = 0; i < initialData.length; i++) {
			if(parseInt(initialData[i].attributes.fields['bullshit']) == 0) {
				obj = {
					attr: {
						"id": initialData[i].attributes.pk
					},
					data: initialData[i].attributes.fields.menu_label,
				}
				tree.push(obj);
			}
		}
		return tree;
	},


	onChildSelect: function(evt) {
		// SHOW CHILD DETAILS
		//console.log("[Editor] Child Selected");

		var child_btn = evt.currentTarget;
		var cat_id = $(child_btn).attr("id");

		$("#category-sz").val(""+cat_id).trigger("change");
	},
	/**
	 *
	 * Callback function called when category list selection changes
	 * it's responsible to create the create the elements table
	 * on table view option and to update the elements displayed
	 * in the map by calling mapHandler.updateCategories()
	 *
	 **/
	onCategorySelect: function(e, data) {

		$("#element-specs").hide();
		
		var catg = [];
		var categories = [];
		var children = [];
		var i;
		var that = this;
		//catg = e.data.cat;
		categories.push(e.target.value);

		if (e.data != undefined) {
		// e.data.mapHandler is a reference to this.options.mapHandler
			e.data.mapHandler.updateCategories(categories);
		}
		BarNotification.remove();

		var cat_id = $("#category-sz :selected").val();
		this.categorySelected = cat_id;

		if (cat_id != undefined) {
	    	$.post(this.serverURL + "/hope/categories/schema/"+cat_id+"/", {csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				var parents = data.parents;
				var parents_text = "";

				for (var i = parents.length-1; i >= 0; i--) {
					parents_text += "<a class='child_editor_class' id='"+parents[i].id+"'>"+parents[i].name+"</a> <i class='icon-angle-right'></i> ";
				}
				
				parents_text += ""+$("#category-sz :selected").text();

				$("#editor_cat_hier").html(parents_text);

			}, "json");

			$.post(this.serverURL + "/hope/categories/childs/"+cat_id+"/", {csrfmiddlewaretoken:$.cookie('csrftoken')}, function(data) {
				//console.log("[ManageView] Get category childs.");
				var template_childs = "";
				var res = $.parseJSON(data)
				for (var i = 0; i < res.length; i++) {
					template_childs += "<li><a id='"+res[i].pk+"' value='"+res[i].fields.menu_label+"' class='child_editor_class'>"+ res[i].fields.order + " -  " + res[i].fields.menu_label+"</a></li>";
				}
				$("#editor_box_childs").html(template_childs);
			});
    	}

		this.renderFeed();
	},

	cleanView: function(element) {
		//console.log("cleaning view");
		element.undelegateEvents();
		element.unbind();
	}
});




/*
|--------------------------------------------------------------------------
| Feature Dialog View
|--------------------------------------------------------------------------
|
| View object that displays and edit a single element data
|
*/

var FeatureDialog = Backbone.View.extend({
	id: 'element-specs',
	renderLock: false,
	selectedFeature: null,

	events: {
		'click follow_report' : 'followReport',
		'click unfollow_report' : 'unfollowReport',
		'click findpage_modal_follow' : 'createModal',
	},

	initialize: function() {
		_.bindAll(this, 'render', 'load', 'unload', 'hide', 'show', 'loadFeature', 'showShapes','loadInfo','followOwner','unfollowOwner', 'renderActivity');
		this.options.mapHandler.on('selectFeature', this.loadFeature, this);

		// comes from DataView
		var that = this;

		this.render();

		//console.log("load info");
		this.loadInfo();
		
	},

	/* -- HELPERS -- */
	show: function() {
		$(this.el).parent().show();
	},

	hide: function() {
		$(this.el).parent().hide();
	},

	load: function() {
		this.render();
	},

	unload: function() {
		this.remove()
		this.renderLock = false;
	},

	/**
	 *
	 * callback function that is responsible
	 * to load the model data from the backend.
	 * This function is listening to the 'selectFeature'
	 * event, that's triggered on GmapHandler.js
	 *
	 **/

	loadFeature: function(feature) {

		selectOnSideBar(feature);

		if (this.selectedFeature) {
			this.selectedFeature = null;
			$(this.el).fadeOut('fast');
		}

		// feature is occurrence_id
		var that = this;
		this.selectedFeature = feature;

		this.model = new TemporaryOccurrence({'_id':feature});
		this.model.fetchWithSchema({
			success:function(model,resp) {
				//console.log("got model"),
				//console.log(model);
				that.loadInfo();
				that.renderActivity();
			}
		});

		$(this.el).fadeIn('fast');
		console.log("load feature!");
		$("#reports-show-shapes").show();	
	},

	showShapes: function() {
		console.log("show shapes for: "+this.model.get('_id'));
	},

	/**
	 *
	 * helper function to work with x-editable
	 * it needs to check the type of data being
	 * rendered and fetch the possible attributes
	 * for instance, select options
	 *
	 **/
	chooseDataType: function(type) {

	},

	/**
	 *
	 * this is a callback function of loadFeature, 'updateSchema'
	 * event trigger when a map selection is performed. it's responsible
	 * to display the selected element specifications and render it
	 * editable.
	 *
	 **/
	loadInfo: function() {
		$(this.el).html("");
		$(this.el).undelegate();
		$(this.el).off();

		if (this.selectedFeature) {
			var total_photos = this.model.get('photos').length;
			var validated = this.model.get('default_values')['validated'];
			var user_name = this.model.get('default_values')['user_name'];
			var date = this.model.get('default_values')['created_at'];
			var follow = this.model.get('default_values')['vote_counter'];
			var owner_id = this.model.get('default_values')['user_id'];
			var is_owner = this.model.get('default_values')['is_owner'];
			var is_following = hopeuser.isFollowingReport(this.model.get('default_values')['id']);
			var is_following_owner = hopeuser.isFollowingUser(this.model.get('default_values')['user_id']);

			var tmpl = _.template($('#feature_info').html(),{'is_following_owner':is_following_owner,
															'is_following':is_following,
															'is_owner' : is_owner,
															report_title:this.model.get('default_values')['title'], 
															id: this.model.get('_id'),
															total_photos: total_photos,
															'validated':validated,
															'user_name':user_name,
															'date':date,
															'followers':follow,
															'owner_id':owner_id
								});

			$("#element-specs").html(tmpl);

			var content_div = $("#selected-feature-content");

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


			// initialize dropzone for file upload

			var photos = this.model.get('photos');

			if(photos.length > 0) {
				for(p in photos){
	          		$("#feature-photos").append("<li class='span4' style='margin-left:0px;margin-right:7px;margin-bottom:7px;max-width:100px;'><a href='"+photos[p].path_big+"' target='_blank' class='thumbnail'><img data-src='"+ photos[p].path_small +"' src='"+photos[p].path_small+"'></a></li>");
					//$("#thumbs").append("<a target='_blank' href='" + photos[p].path_medium + "'><img src='" + photos[p].path_small + "'/></a>");
				}
			}

			
			var fb_width = $("#element-specs").width() - 10;


			$("#element-specs").append('<div class="row-fluid"><div class="span12"><div class="fb-comments" data-href="http://testeteste.pt/hope/#map/' + this.model.get('_id') + '" data-width="' + fb_width + '"></div></div></div>');
			FB.XFBML.parse(document.getElementById('element-specs'));


			$("#element-specs").show();
			BarNotification.remove();


			$('.follow_report').on('click',this.followReport);
			$('.unfollow_report').on('click',this.unfollowReport);
			$('.follow_owner').on('click',this.followOwner);
			$('.unfollow_owner').on('click',this.unfollowOwner);
			$('.findpage_modal_follow').on('click', { model: this.model } , this.createModal);
			$("#reports-show-shapes").on('click', this.showShapes);

 
		} else {
			$(this.el).html('<p>Sem nenhuma feature selecionada</p>');
		}


	},

	followReport: function(evt) {
		//console.log('following report');
		// update buttons
		$(evt.target).hide();
		$(".unfollow_report").show();

		// update counters
		var counter = $("#findpage_counter").html();
		$("#findpage_counter").html(parseInt(counter) + 1);
		
		window.reports_header_counter += 1;
		$("#reports-header-counter").html(window.reports_header_counter);

		hopeuser.addOccurrencesFollowing(evt.target.rel);

		$.get('/hope/occurrences/follow/' + evt.target.rel, function() {
			BarNotification.remove();
		});
		
	},

	unfollowReport:function(evt) {
		//console.log('unfollowing report');
		//update buttons
		$(evt.target).hide();
		$(".follow_report").show();

		// update counters
		var counter = $("#findpage_counter").html();
		$("#findpage_counter").html(parseInt(counter) - 1);

		window.reports_header_counter -= 1;
		$("#reports-header-counter").html(window.reports_header_counter);

		hopeuser.removeOccurrencesFollowing(evt.target.rel);


		$.get('/hope/occurrences/unfollow/' + evt.target.rel, function() {
			BarNotification.remove();
		});
	},

	followOwner:function(evt) {
		$.get('/hope/users/follow/' + evt.target.rel, function() {
			BarNotification.remove();
		});
		$(evt.target).hide();

		hopeuser.addFollowing(evt.target.rel);

		$('#following-header-counter').html(hopeuser.get('following').length);


		$('.unfollow_owner').show();

		evt.preventDefault();
	},

	unfollowOwner: function(evt) {
		$.get('/hope/users/unfollow/' + evt.target.rel, function() {
			BarNotification.remove();
		});

		$(evt.target).hide();

		hopeuser.removeFollowing(evt.target.rel);
		$('#following-header-counter').html(hopeuser.get('following').length);


		$('.follow_owner').show();

		evt.preventDefault();
	},

	createModal:function(evt) {
		//console.log('creating followers modal view');
		this.followersModal = new FollowersModalView({view: this, model: evt.data.model,page: '#modal_div_editor'});
		evt.preventDefault();
	},

	renderActivity: function() {
		//console.log("RENDER ACTIVITY");
		var that = this;
		$.get('/hope/feed/report/' + that.model.get('_id') + '/0/10', function(data) {
			if(data.length > 0) {
				
				//console.log("RENDERING REPORT FEED");

				var $report_feed_container = $('#findreport-feed-container');	
				$report_feed_container = $('#findreport-feed-container').html('');	

				for(var feed in data) {

					var tmpl = _.template($('#report_feed').html(), {feed: data[feed]});
					$report_feed_container.append(tmpl);
					//console.log(data[feed]);
				}
			}
		});	
	},

	/**
	 *
	 *	Renders Category List
	 *	ready to be killed
	 **/
	render: function() {
		if (!this.renderLock) {
			this.renderLock = true;
			$(this.options.container).append(this.el);
		}
	}
});
