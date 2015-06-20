var GroupModel = Backbone.Model.extend({



});

var GroupsList = Backbone.Collection.extend({
	
	name:'groups',
	model: GroupModel,
	url: function() {
		var url = 'hope/groups/0/'
		return url;
	}
});

