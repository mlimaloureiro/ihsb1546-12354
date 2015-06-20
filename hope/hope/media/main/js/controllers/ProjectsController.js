/*
|--------------------------------------------------------------------------
| ProjectsController
|--------------------------------------------------------------------------
|
| Entire project frontcontroller. It's responsible to check the state
| of the app and create the main objects.
|
*/

var ProjectsController = Backbone.Router.extend(
{
	initialized: false,

	routes: {
		'' : 'index',
		'map' : 'map',
		'map/:id' : 'map',
		'report': 'report',
		'report/:id': 'report',
		'manage': 'manage',
		'groups': 'groups',
		'decision': 'decision',
		'user':'profile',
		'user/:id':'profile'
	},
	
	initialize: function(options){

		/* get counter values */
		var that = this;
		/* create new user */
		window.hopeuser = new HopeUser();


		$.get('/hope/users/info', function(data) {
			hopeuser.set('id',parseInt(data.id));
			hopeuser.set('following',data.following);
			hopeuser.set('followers',data.followers);
			hopeuser.set('occurrences_following',data.occurrences_following);


			$("#following-header-counter").html(data.following.length);
			window.following_header_counter = data.following;

			$("#followers-header-counter").html(data.followers.length);
			window.followers_header_counter = data.followers;
			//console.log(hopeuser);
		});


		window.hopeLatestReports = null;
		window.topReports = null;


		$.get('/hope/users/occurrences/count', function(data) {
			//console.log(data);
			$("#reports-header-counter").html(data.count);
			window.reports_header_counter = data.count;
			hopeuser.set('total_occurrences',data.count);
		},'json');



		this.options = _.extend({}, this.options, options);
		
		this.options.app.findreportsview = new FindReportsView({app: this.options.app});
		this.options.app.reportview = new ReportView({app: this.options.app});
		this.options.app.manageview = new ManageView({app: this.options.app});
		this.options.app.groupsview = new GroupsView({app: this.options.app});
		this.options.app.decisionview = new DecisionView({app: this.options.app});
		this.options.app.profileview = new ProfileView({app: this.options.app});


		$('#following-header-counter').on('click',function() {new UsersModalView()});
		$('#followers-header-counter').on('click',function() {new UsersModalView()});

		
	},
	
	index: function(){
		this.navigate("map", {trigger:true});
		//window.location.hash = '#map'
	},
	
	map: function(id){

		this.options.app.setPreviousState();
		
		this.options.app.findreportsview.hide();
		this.options.app.manageview.hide();
		this.options.app.reportview.hide();
		this.options.app.groupsview.hide();
		this.options.app.decisionview.hide();
		this.options.app.changeView(this.options.app.findreportsview, {'rid':id});

	},

	/**
	 *
	 * This view enables the user to insert new
	 * occurences
	 *
	 **/
	report: function(id) {
		this.options.app.setPreviousState();

		this.options.app.reportview.reopen();

		this.options.app.findreportsview.hide();
		this.options.app.manageview.hide();
		this.options.app.groupsview.hide();
		this.options.app.decisionview.hide();
		this.options.app.changeView(this.options.app.reportview, {'rid':id});

	},

	manage: function() {
		this.options.app.setPreviousState();

		this.options.app.findreportsview.hide();
		this.options.app.reportview.hide();
		this.options.app.groupsview.hide();
		this.options.app.decisionview.hide();
		this.options.app.changeView(this.options.app.manageview);
	},

	groups: function() {
		this.options.app.setPreviousState();

		this.options.app.findreportsview.hide();
		this.options.app.manageview.hide();
		this.options.app.reportview.hide();
		this.options.app.decisionview.hide();
		this.options.app.changeView(this.options.app.groupsview);
	},

	decision: function() {
		this.options.app.setPreviousState();

		this.options.app.findreportsview.hide();
		this.options.app.reportview.hide();
		this.options.app.manageview.hide();
		this.options.app.groupsview.hide();
		this.options.app.changeView(this.options.app.decisionview);

	},

	profile: function(id) {
		this.options.app.setPreviousState();
		
		this.options.app.findreportsview.hide();
		this.options.app.manageview.hide();
		this.options.app.groupsview.hide();
		this.options.app.decisionview.hide();
		this.options.app.reportview.hide();
		this.options.app.changeView(this.options.app.profileview, {'uid':id});
	}

});

/*
|--------------------------------------------------------------------------
| FollowersModalView
|--------------------------------------------------------------------------
| This view generates the modal window that controls the report followers 
| permissions
| 
*/
var UsersModalView = Backbone.View.extend({
		
	events: {
		'click .teste': 'teste',
		'click .teste2' : 'teste'
	},

	el: $("#followers_modal"),

	initialize: function(options) {
		_.bindAll(this,'followUser','unfollowUser');

		this.usersList = new UsersList();
		this.usersList.fetch({reset:true});

		var that = this;

		this.usersList.on('reset',this.render,this);
	},

	followUser: function(evt) {
		evt.preventDefault();

		$.get('/hope/users/follow/' + evt.target.rel, function() {
			BarNotification.remove();
		});

		$(evt.target).hide();
		$el = $(evt.target);

		var parent = $(evt.target).parent().find('.user_unfollow_modal_button');
		parent.show();
		//console.log(parent.html());
		hopeuser.addFollowing(evt.target.rel);
		$('#following-header-counter').html(hopeuser.get('following').length);

		//$('.user_unfollow_modal_button').show();

	},

	unfollowUser: function(evt) {
		evt.preventDefault();
		$.get('/hope/users/unfollow/' + evt.target.rel, function() {
			BarNotification.remove();
		});
		$el = $(evt.target);

		$(evt.target).hide();

		hopeuser.removeFollowing(evt.target.rel);
		$('#following-header-counter').html(hopeuser.get('following').length);

		var parent = $(evt.target).parent().find('.user_follow_modal_button');
		parent.show();


	},

	render: function() {

		//console.log(this.usersList);

		var following = _.pluck(hopeuser.get('following'),'id');
		var followers = _.pluck(hopeuser.get('followers'),'id');

		var tmpl = _.template($('#user_modal_follow').html(),{'usersList':this.usersList,'following':following,'followers':followers});

		$('.modal_div_report').html(tmpl);

		$('.user_follow_modal_button').on('click',this.followUser);
		$('.user_unfollow_modal_button').on('click',this.unfollowUser);


		this.delegateEvents();
		$('#user_followers_modal').modal('show'); 
		BarNotification.remove();

		
	}

});