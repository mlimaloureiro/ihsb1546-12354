var SchemaListItemView = Backbone.View.extend({
	tagName:"li",
	template:_.template($("#template_list_item").html()),

	events: {
	},

	initialize:function(){
		this.model.bind("reset", this.render, this);
		this.model.bind("activate", this.openModel, this);
	},

	openModel:function(){
		$('li', this.parent).removeClass("active");
		$(this.el).toggleClass("active");
		
	},

	render:function(eventName){
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	}
})