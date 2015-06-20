var GroupsView = Backbone.View.extend({

	loaded: false,
	el: $("#page"),
	serverURL: window.location.origin,

	initialize: function() {
		_.bindAll(this, 'load', 'renderGroupsTemplate','renderList','createNewGroup','onGroupSelect','addRemoveUser');
		this.groupsList = new GroupsList();
		this.usersList = new UsersList();

		this.groupsList.on('reset', this.renderList, this);
		this.groupsList.on('add',this.renderList,this);
		this.usersList.on('reset',this.renderUsers,this);

	},	

	load: function(options) {
		//console.log("[GroupsView] Load");
		if (!this.isLoaded()) {
			var that = this;
			this.renderGroupsTemplate();
			this.groupsList.fetch({reset:true});
		}
		this.loaded = true;
	},

	renderGroupsTemplate: function() {
		//console.log("[GroupsView] Render Groups Template");
		var page = _.template($("#groups-page-template").html());
		$("#page").append(page);

		$("#new_group_btn").on('click',this.createNewGroup);
	},

	createNewGroup: function(evt) {
		$el = $("#new_group_value");

		var test = false;

		// validate
		this.groupsList.each(function(group) {
			if(group.get('name').toUpperCase() == $el.val().toUpperCase()) {
				test = true;
				return false;
			}
		});

		if(test) {
			BarNotification.init({message: 'Error! Name already in use. Choose another name.', type: 'error'});
		} else {

			this.groupsList.create({'name' : $el.val()});
			BarNotification.init({message: $el.val() + ' created successfully.', type: 'success'});
			$el.val('');
		}
		evt.preventDefault();
	},

	renderList: function() {
		//console.log("[GroupsView] Render Groups List");
		//creates the form template skeleton	

		$("#groups_list_div").html('');

		this.groupsList.each(function(group) {
			$("#groups_list_div").append("<li><a href='#' rel='" + group.get('id') + "' class='group-link-li'> " + group.get('name') + " </a></li>");			
		});

		$('.group-link-li').off();
		$('.group-link-li').on('click',this.onGroupSelect);
	},


	onGroupSelect: function(evt) {
		$el = $(evt.target);
		id = $el.attr('rel');

		var page = _.template($("#groups_manage_content").html());
		$("#groups_manage_details").html(page);

		this.selectedGroup = id;

		this.usersList.fetch({reset:true});

		evt.preventDefault();
	},

	renderUsers: function() {
		$el = $('#users_list_div');

		var style = "style = 'background-color:#ededed;'";

		var group = this.groupsList.findWhere({id:parseInt(this.selectedGroup)});
		//console.log(group.get('userlist'));

		this.usersList.each(function(user) {
			var test = _.filter(group.get('userlist'), function(index){ return index.id == user.get('id') });
			
			if(test.length > 0) {
				$el.append("<li><a href='#' "+ style +" rel='" + user.get('id') + "' data-name='" + user.get('name') + "' data-ongroup='1' class='user-link-li'> " + user.get('name') + " </a></li>");
			} else {
				$el.append("<li><a href='#' rel='" + user.get('id') + "' data-name='" + user.get('name') + "' data-ongroup='0' class='user-link-li'> " + user.get('name') + " </a></li>");
			}
		});

		$('.user-link-li').off();
		$(".user-link-li").on('click', this.addRemoveUser);
	},


	/* create AddRemoveUser calling /hope/groups/operation/1 or 0 */


	addRemoveUser: function(evt) {
		var $el = $(evt.target);
		var user_id = $el.attr('rel');
		var group_id = this.selectedGroup;
		var user_name = $el.data('name');

		var that = this;		
		var group = this.groupsList.findWhere({id:parseInt(this.selectedGroup)});

		if(parseInt($el.data('ongroup')) == 1) {
			// remove
			$.post(this.serverURL + "/hope/groups/operation/", {
				csrfmiddlewaretoken: $.cookie('csrftoken'), 
				user_id: user_id, 
				group_id: group_id,
				operation: 0
			}, function(data) {

				if (data.success == true) {
					
					BarNotification.init({message: user_name + ' removed from group.', type: 'warning'});
					$el.css('background-color','');
					$el.data('ongroup',0);
					
					//var test = _.filter(group.get('userlist'), function(index){ return index.id == user.get('id') });
					var userlist = group.get('userlist');

					for(u in group.get('userlist')) {
						if(group.get('userlist')[u].id == user_id) {
							group.get('userlist').splice(u,1);
						}
					}

					//console.log(group);

				} else {
					BarNotification.init({message: 'Error removing from group.', type: 'error'});
				}
				
			}, "json");


		} else {
			$.post(this.serverURL + "/hope/groups/operation/", {
				csrfmiddlewaretoken: $.cookie('csrftoken'), 
				user_id: user_id, 
				group_id: group_id,
				operation: 1
			}, function(data) {

				if (data.success == true) {
					
					BarNotification.init({message: user_name + ' added on group.', type: 'success'});
					$el.css('background-color','#ededed');
					$el.data('ongroup',1);

					group.get('userlist').push({'id': user_id});

					//console.log(group);

				} else {
					BarNotification.init({message: 'Error adding on group.', type: 'error'});
				}
				
			}, "json");
		}

		evt.preventDefault();
	},


	cleanView: function(element) {
		element.undelegateEvents();
		element.unbind();
	},

	/* --- HELPERS --- */
	hide: function() {
		$("#groups-page").hide();
	},
	
	show: function() {
		$("#groups-page").show();
	},

	initHook: function() {
		console.log('[GroupsView] Initting');

		if(!this.isLoaded) {
			this.load();
		}
	},

	exitHook: function() {
		this.options.app.log('[GroupsView] Exiting');
	},

	unload: function() {
		this.loaded = false;
	},
	
	isLoaded: function() {
		return this.loaded;
	},
	/* -- -- */



});