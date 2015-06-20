var FollowersList = Backbone.Model.extend({
	
	name:'followers',
	
	initialize: function(options){
		this.occurrence_id = options.occ_id;
	},
	
	url: function() {
		var url = 'hope/occurrences/followers/' + this.occurrence_id;
		return url;
	}
});