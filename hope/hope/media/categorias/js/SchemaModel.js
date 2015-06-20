var Schema = Backbone.Model.extend({
	name:'schema',
	//idAttribute:"_id['$oid']",
	/*id: null,

	url: function() {
		var url = '/categories/schema/'
		if (this.id != undefined)
			url += this.id + '/';
			
		return url;
	},

	initialize: function(options) {
		this.id = options._id;
		console.log(options);
		console.log('init schema');
		if(this.has('_id'))
			this.set('id', this.get('_id'));

		this.fieldsCollection = new Backbone.Collection(this.get('fields'));

		this.fieldsCollection.bind("change", this.updateFields, this);
		this.fieldsCollection.bind("add", this.updateFields, this);
		this.fieldsCollection.bind("destroy", this.updateFields, this);

	},
*/
	initialize: function(options) {
		console.log(options);
	},

	updateFields: function(){
		this.set("fields", this.fieldsCollection.toJSON());

		console.log(this.get("fields"));
	}
});
