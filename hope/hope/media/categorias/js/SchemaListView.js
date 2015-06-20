var SchemaListView = Backbone.View.extend({
	tagName:"ul",
	className:"nav nav-list",
	initialize:function(){
		this.model.bind("reset", this.render, this);
		this.model.bind("sync", this.render, this);
		this.model.bind("change", this.render, this);
	},

	render: function(eventName){
		var that = this;
		$(this.el).html('');
		$(this.el).append('<li class="nav-header">Object types</li>');
		_.each(this.model.models, function(schema){
			$(that.el).append(new SchemaListItemView({model:schema}).render().el)
		}, this);

		$(this.el).append('<a data-target="#new_class_input" data-toggle="modal" style="float: right;"><i class="icon-plus"></i></a>');

		return this;
	}
});