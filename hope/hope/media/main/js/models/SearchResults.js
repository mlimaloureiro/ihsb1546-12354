var SearchResultItem = Backbone.Model.Extend({
	name: 'search_result_item',

});

var SearchResults = Backbone.Collection.Extend({
	model: SearchResultItem,

	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
	},

	url: function(){
		var url = window.app.project+"/search";

		if(this.options.query){
			url += "/?q="+this.options.query;
		}

		if(this.options.category){
			url += "&cat="+this.options.category;
		}

		return url;
	}
});