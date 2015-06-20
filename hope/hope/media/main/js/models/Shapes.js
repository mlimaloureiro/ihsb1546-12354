var ShapeList = Backbone.Collection.extend({
	category_id: null,
	initialize: function(options){
		if(options != undefined) {
			this.category_id = options.category_id;
		}
	},
	
	url: function() {
		var url = '/hope/shapes/' + this.category_id;
		return url;
	}
});


