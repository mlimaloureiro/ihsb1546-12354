/* NEED TO FETCH WITH NEW MYSQL DB */

var Schema = Backbone.Model.extend({
	name: 'schema',
	id: null,
	url: function(){
		return '/hope/categories/schema/' + this.id;
	},

	initialize: function(options) {
		this.id = options._id;
	}
});
