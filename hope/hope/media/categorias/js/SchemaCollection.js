var SchemaCollection = Backbone.Collection.extend({
	model: Schema,
	url:"../mongo/smartroads/schemas",

	initialize: function(){
		this.bind("sync", this.reFetch, this);
	},

	reFetch: function(){
		console.log("trying to refresh")
		this.fetch();
	}
});
