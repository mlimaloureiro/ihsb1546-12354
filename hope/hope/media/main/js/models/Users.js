var UsersModel = Backbone.Model.extend({



});

var UsersList = Backbone.Collection.extend({
	
	name:'users',
	model: UsersModel,
	url: function() {
		var url = 'hope/users/'
		return url;
	}
});

