/*
|--------------------------------------------------------------------------
| ProfileView
|--------------------------------------------------------------------------
| 'Front Controller' to #decision view
| View responsible for object creation with map shape editing 
| features.
| 
*/

var ProfileView = Backbone.View.extend({

	/**
	 *
	 * el: 			profile-page is the div#id 
	 * template: 	#profile-page-template, find it in templates/templates-profile.html.
	 *
	 **/
	events: {
	},

	loaded: false,
	editMode: false,
	el: $("#page"),
	
	serverURL: window.location.origin,

	initialize: function() {
		_.bindAll(this, 'render');
		this.app = this.options.app;
	},

	
	load: function(options) {
		//console.log("[ProfileView] Load.");
		if (!this.isLoaded()) {
			var that = this;
			this.renderProfileTemplate();	
		}
		this.loaded = true;
		this.delegateEvents();
	},

	/**
	 *
	 * Renders the profile template, it appends it to page div
	 *
	 **/
	renderProfileTemplate: function() {
		//console.log("[ProfileView] Render Profile Template.");
		var page = _.template($("#profile-page-template").html());
		$("#page").append(page);
	},

	renderUser: function(id) {
		$.getJSON(this.serverURL + "/hope/feed/user/"+id+"/0/0", function(data) {
			var template = "<div class='row-fluid feed'>";
			var feeds = data.feeds;
			$("#activity-fluid").html('');
			//console.log(feeds);
			if (id != 0) {
				$("#box-profile").show();
				if (data.feeds != undefined) {
					for (var i = 0; i < feeds.length; i++) {
						var r_photo = feeds[i].path_photo;
						if (r_photo == undefined) {
							r_photo = "http://placehold.it/300x300&text=No%20picture";
						} else {
							r_photo = "http://webmoth.dec.uc.pt/static/"+r_photo;
						}
						var main_r = feeds[i].feed.pop(0);
						//console.log(main_r);
						//console.log(feeds[i].feed);
						//console.log(feeds[i].report_title);
						//console.log(feeds[i].time);
						//console.log(r_photo);
						
						template += _.template($("#row-activity").html(), {
							feed: feeds[i].feed,
							main: main_r,
							report_title: feeds[i].report_title,
							time: feeds[i].time,
							photo: r_photo
						});

						if ((i+1) % 4 == 0) {
							template += "</div>";
							template += "<div class='row-fluid feed'>";
						}
					};
					template += "</div>";
					$("#activity-fluid").html(template);
				}

				var user = data.user;
				var template = _.template($("#user-profile").html(), {
					username: "@"+user.name,
					reports: user.occ_following.length,
					following: user.following.length,
					followers: user.followers.length
				});
			} else {
				$("#activity-fluid").html('');
				$("#box-profile").hide();
				if (data.feeds != undefined) {
					for (var i = 0; i < feeds.length; i++) {
						var r_photo = feeds[i].path_photo;
						if (r_photo == undefined) {
							r_photo = "http://placehold.it/300x300&text=No%20picture";
						} else {
							r_photo = "http://webmoth.dec.uc.pt/static/"+r_photo;
						}


						var main_r = feeds[i].feed.pop(0);
						template += _.template($("#row-activity").html(), {
							
							feed: feeds[i].feed,
							main: main_r,
							report_title: feeds[i].report_title,
							time: feeds[i].time,
							photo: r_photo
						});

						if ((i+1) % 4 == 0) {
							template += "</div>";
							template += "<div class='row-fluid feed'>";
						}
					};
					template += "</div>";
					$("#activity-fluid").html(template);
				}
			}

			$("#activity-header").html(template);

			$(function() {
					var timer = setInterval(showDiv, 100);
					var counter = 0;
					function showDiv() {
						if (counter == 0) {
							counter++;
							return;
						}

						$($('.feedcol')[counter-1]).fadeIn('slow');
						if (counter == $('.feedcol').length) {
							clearInterval(timer);
						} else {
							counter++;
						}
					}
			});			
			
			$('#following-counter-user').on('click',function() {new UsersModalView()});
			$('#followers-counter-user').on('click',function() {new UsersModalView()});
		});
		
	},

	renderProfile: function() {
		//console.log("render profile");
		$("#box-profile").hide();
		$.getJSON(this.serverURL + "/hope/feed/user/0/0/0", function(data) {
			var template = "<div class='row-fluid'>";
			var feeds = data.feeds;

			if (data.feeds != undefined && data.feeds.length > 0) {
				for (var i = 0; i < feeds.length; i++) {
					template += _.template($("#row-activity").html(), {
						feed: feeds[i].feed,
						report_title: feeds[i].report_title,
					});
					if ((i+1) % 4 == 0) {
						template += "</div>";
						template += "<div class='row-fluid'>";
					}
				};
				template += "</div>";
				$("#activity-fluid").html(template);
			}

		});
	},

	render: function(categories) {
		//console.log("[ProfileView] Render Categories List.");
	},
	
	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
	},

	/* --- HELPERS --- */
	hide: function() {
		$("#profile-page").hide();
	},
	
	show: function() {
		$("#profile-page").show();
	},

	initHook: function(options) {
		//console.log('[ProfileView] Initting');
		var that = this;

		if(!this.isLoaded) {
			this.load();
			if (options.uid != undefined)
				this.renderUser(options.uid)
			else
				this.renderUser(0);
		} else {
			if (options.uid != undefined)
				this.renderUser(options.uid)
			else
				this.renderUser(0);
		}

		//$('#profile-menu-button').removeClass('btn-default');
		//$('#profile-menu-button').addClass('btn-blue');

	},

	exitHook: function() {
		//this.options.app.log('[ProfileView] Exiting');
	},

	unload: function() {
		this.loaded = false;
	},
	
	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */

});
