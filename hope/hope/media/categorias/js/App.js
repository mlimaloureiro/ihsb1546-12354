var App = Backbone.Router.extend({
	routes:{
		"schemas/:id":"schemaDetails",
		"create_class": "newClass"
	},

	initialize: function(options){
		_.bindAll(this, "schemaDetails", "newClass");

		this.activeModel = null;

		this.schemaList = new SchemaCollection();
		this.schemaListView = new SchemaListView({model:this.schemaList});
		this.schemaList.fetch();

		$("#tree_schemas").html(this.schemaListView.render().el);
	},

	schemaDetails:function(id){
		this.schemaDetail = this.schemaList.get(id);
		this.schemaDetail.trigger("activate");
		$("#right_pane").html('');

		this.schemaDetailView = new SchemaView({model:this.schemaDetail});
		$("#right_pane").append(this.schemaDetailView.render().el);

		this.activeModel = this.schemaDetail;

		//this.schemaDetailView.render();
	},

	newClass: function() {

		var newObject = new Schema({
			name:$("#new_class_name").val(),
			ancestors: [],
			parent: null,
			fields: []
		});

		var that = this;
		newObject.save({}, {wait:true, success: function(){
			that.schemaList.fetch();
		}});

		
		this.navigate('');

		$("#new_class_input").modal("hide");
	}
});

var app = new App();
Backbone.history.start();



