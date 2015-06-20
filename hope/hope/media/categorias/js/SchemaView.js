var SchemaView = Backbone.View.extend({
	tagName:"div",
	className:"span9",
	id:"type_info",
	template: _.template($("#template_schema").html()),

	events: {
		"click #save_model": "saveModel",
		"click #delete": "deleteModel",
		"click #add_field": "addField",
		//"click #category_name": "toggleNameEdit"
	},

	initialize: function(){
		this.render();
		this.changed = false;

		$("#save_model", this.el).prop("disabled", true);

		this.model.bind("change", this.modelChanged, this);
		//this.model.fieldsCollection.bind("change", this.modelChanged, this);
		this.model.fieldsCollection.bind("add", this.addedField, this);
		this.model.fieldsCollection.bind("destroy", this.render, this);
	},

	modelChanged: function(){
		this.changed = true;
		$("#save_model", this.el).prop("disabled", false);

		console.log("Model "+this.model.id+" has been edited");
	},

	saveModel: function(){
		console.log("Saving model");
		var that = this;
		this.model.save({}, {success: function(model, response){
			$("#save_model", that.el).prop("disabled", true);
		}});
	},

	deleteModel: function(){
		if(confirm("Are you sure you want to delete this model?")){
			this.model.destroy({wait:true, success:function(){
				console.log("Destroyed successfully");
				app.schemaList.fetch();
			}
			});
		}
	},

	toggleNameEdit: function(){
		$("#category_name", this.el).html('<input type="text" value="'+this.model.get('name')+'"/>')
	},

	addField: function(){
		this.model.fieldsCollection.push({name:"New field", type:"string"});
	},

	addedField:function(model){
		$("#type_details", this.el).append(new FieldView({model: model}).render().el);
	},

	render: function(eventName){
		var that = this;
		$(this.el).html(this.template(this.model.toJSON()));

		if(this.changed){
			$("#save_model", that.el).prop("disabled", false);
		}else{
			$("#save_model", that.el).prop("disabled", true);
		}

		$("#type_details", this.el).html('');
		_.each(this.model.fieldsCollection.models, function(field){
			//$(that.el).append("<tr><td>"+field.name+"</td>"+"<td>"+that.renderField(field)+'</td></tr>');
			$("#type_details", that.el).append(new FieldView({model: field}).render().el);
		});

		return this;
	},
});