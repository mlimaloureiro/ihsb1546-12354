var FieldView = Backbone.View.extend({
	tagName: "tr",
	template: _.template($('#field_view_template').html()),
	events:{
		"click .edit": "toggleEdition",
		"change #basic_type": "baseTypeChange",
		"click #delete_field": "deleteThis",
		"change": "altered",
	},

	initialize: function(){
		_.bindAll(this, "baseTypeChange", "deleteThis");

		this.model.bind("reset", this.render, this);
		this.editing = false;
		this.changed = false;

		this.possible_types = ['int', 'real', 'string', 'enum', 'reference', 'embedded', 'array', 'photo'];
		this.composite_types = ['array', 'reference', 'enum', 'embedded'];
		this.array_basics = ['int', 'real', 'string', 'photo'];

		this.display = {
			'int': 'Integer',
			'real': 'Real',
			'string': 'String',
			'enum': 'Codified Field',
			'reference': 'Reference',
			'embedded': 'Embedded',
			'array': 'Collection',
			'photo': 'Photo'
		}
	},

	render: function(){
		this.renderShow();

		return this;
	},

	renderShow: function(){
		var data = {
			name: this.model.get('name'),
			type: this.model.get('type')
		}

		switch(this.model.get('type')){
			case 'int':
			data['type'] = "Integer";
			break;
			case 'real':
			data['type'] = "Real";
			break;
			case 'string':
			data['type'] = "String";
			break;
			case 'enum':
			data['type'] = "Codified Field";
			break;
			case 'reference':
			var ref = app.schemaList.get(this.model.get('ref')['$oid']);
			data['type'] = 'Reference to <a href="#schemas/'+ref.id+'">'+ref.get('name')+' </a>';
			break;
		}

		if(this.model.get('type').indexOf("array") == 0){
			data['type'] = "Collection of ";

			var array_type = this.model.get('type').split('#')[1];
			if (["int", "real", "string", "photo"].indexOf(array_type) >= 0){
				data['type'] += this.display[array_type];
			}else{
				var ref = app.schemaList.get(this.model.get('ref')['$oid']);
				data['type'] += '<a href="#schemas/'+ref.id+'">'+ref.get('name')+'</a>';
			}
		}

		$(this.el).html(this.template(data));
	},

	getValidOptions: function(type) {
		var result = [];
		switch(type){
			case "array":
			result.push({value: "int", text:"Integer"});
			result.push({value: "real", text:"Real"});
			result.push({value: "string", text:"String"});
			result.push({value: "photo", text:"Photos"});
			//Note that it includes the fields from reference - no break
			case "reference":
			var types = app.schemaList.models;

			for (var i = 0; i < types.length; i++) {
				result.push({value: types[i].id, text: types[i].escape("name")})
			};
			break;

		}
		return result;
	},

	baseTypeChange: function(){
		this.renderSecondary();
	},

	renderSecondary: function(){
		/* find new type on possible_types */
		var new_type = this.possible_types[$("#basic_type", this.el).find(":selected").val()];
		var combo = "";

		/* new_type in composite_types ? */
		if(this.composite_types.indexOf(new_type) >= 0){
			combo = '<select id="secondary_type">'

			/* Valid options for new_type */
			var valid_options = this.getValidOptions(new_type);

			var selected = false;

			/* Select values */
			for(i in valid_options){
				if(new_type == "array" && this.model.get("type").split("#")[1] == valid_options[i]['value'] && !selected){
					combo += '<option value="'+valid_options[i]['value']+'" selected="true">'+valid_options[i]['text']+'</option>'
					selected = true;
				}else if(valid_options[i]['value'] == (this.model.get("ref") ? this.model.get("ref")['$oid']: undefined) && !selected){
					combo += '<option value="'+valid_options[i]['value']+'" selected="true">'+valid_options[i]['text']+'</option>'
					selected = true;
				}else{
					combo += '<option value="'+valid_options[i]['value']+'" >'+valid_options[i]['text']+'</option>'
				}
			}

			combo += "</select>"

			/* Add html */
			$("#secondary_edit", this.el).html(combo);
		}else{
			$("#secondary_edit", this.el).html("");
		}

		/* Add button to delete field (after click on edit button) */
		combo += '<button id="delete_field" class="btn btn-mini btn-danger"><i class="icon-minus icon-white"></i></button>'

		$("#secondary_edit", this.el).html(combo);
	},

	altered: function(){
		this.changed = true;
	},

	validateEdition: function(){
		if($("#name_field", this.el).val() != this.model.get("name")){
			this.changed = true;

			this.model.set("name", $("#name_field", this.el).val());
		}
		if(this.changed){
			var new_type = this.possible_types[$("#basic_type", this.el).find(":selected").val()];
			
			if(this.composite_types.indexOf(new_type) >= 0){
				valid = true;
				var ref = ""; //Helper variable
				switch(new_type){
					case 'array':
					ref = $("#secondary_type", this.el).find(":selected").val();
					if (["int", "real", "string", "photo"].indexOf(ref) >= 0){
						this.model.set("type", "array#"+ref);
						break;
					}else{
						new_type = "array#reference";
					}
					//If it didn't break, treat as reference - no break
					case 'reference':
					//TODO - validate with models? (server side probably)
					ref = $("#secondary_type", this.el).find(":selected").val();
					this.model.set("type", new_type);
					this.model.set("ref", {'$oid': ref});
					break;
					case 'enum':
					//Check if enum is valid/exists
					valid = false;
					break;
				}
			}else{
				this.model.set("type", new_type);
			}
		}

		// set changed to false again
		this.changed = false;
	},

	deleteThis: function(){
		this.model.destroy();
	},

	toggleEdition: function(){
		$(".edit", this.el).toggleClass('btn-primary');
		this.editing = !this.editing;

		if(this.editing){
			$("#name", this.el).html('<input id="name_field" type="text" value="'+this.model.escape("name")+'"></input>');

			combo = '<select id="basic_type">'
			current_type = 0;

			/* Select possible types and add to options field */
			for(i in this.possible_types){
				/* set selected true for the selected option (possible_types == 0) */
				if(this.model.get('type').indexOf(this.possible_types[i]) == 0){
					combo += '<option value="'+i+'" selected="true">'+this.display[this.possible_types[i]]+'</option>';
				}else{
					combo += "<option value="+i+">"+this.display[this.possible_types[i]]+"</option>";
				}
			}

			combo += "</select>"

			/* Set content and render secondary */
			$("#content", this.el).html(combo);

			this.renderSecondary();
		}else{
			this.validateEdition();
			//Check if changed
			//TODO - Save model, push to server and render correctly
			//Maybe this part should be a routine, to trigger when exiting edition by other means(close page, change cat, etc...)
			this.render();
		}
		
	}
});