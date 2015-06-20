/* NEED TO FETCH WITH NEW MYSQL DB */

var Occurrence = Backbone.Model.extend({
	name: 'occurrence',
	
	url: function(){
		return 'hope/occurrences/'+this.get('_id')['$oid']+'/';
	}
});

var OccurrenceList = Backbone.Collection.extend({
	model: Occurrence,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
		if (this.options.top && this.options.bottom && this.options.left && this.options.right){
			this.bbox = true
		} else {
			this.bbox = false
		}
		
	},
	
	url: function() {
		var url = 'hope/occurrences/1';

		if (this.bbox){
			url += '&top='+this.options.top+'&bottom='+this.options.bottom+'&left='+this.options.left+'&right='+this.options.right;
		}
		
		if (this.options.shape_id){
			url += '&shape_id=' + this.options.shape_id
		}
		
		return url;
	}
});


var TemporaryOccurrence = Backbone.Model.extend({
	name: 'tempoccurrence',
	id: null,
	initialize: function(options) {
		if(options != undefined)
			this.id = options._id;
	},

	url: function() {
		// 0 means new occurrence
		var url = 'hope/occurrences/'
		if (this.id != undefined)
			url += this.id + '/';
		else
			url += '0/';
			
		return url;
	},
	
	fetchWithSchema: function(options){
		this.fetch({
			success: function(model, resp){
				if(model.attributes.default_values != null)
					model.schema = new Schema({_id: model.attributes.default_values.category_id});
				else
					model.schema = new Schema({_id: model.get('category_id')});
				model.schema.elementModel = model;
				model.schema.fetch({
					success: function(model, resp){
						model.elementModel.trigger('updateSchema');
						if (options && options.success)
							options.success(model,resp);
					} 
				});
			},
			error: function(model, resp){
				if (options && options.error)
					options.error(model, resp);
			}
		});
	},

	destroyHook: function(options) {
		$.ajax({
		    url: this.url(),
		    type: 'DELETE',
		    success: function(result) {
		        //console.log("element deleted");
		    }
		});
	}

});

var TemporaryOccurrenceList = Backbone.Collection.extend({
	model: TemporaryOccurrence,
	category_id: null,
	initialize: function(options){
		this.options = _.extend({}, this.options, options);
		this.category_id = options.category_id;
	},
	
	url: function() {
		// occurrences/all/confirmed
		return 'hope/occurrences/all/' + this.category_id;
	}
});



var UserOccurrenceList = Backbone.Collection.extend({
	model: TemporaryOccurrence,
	
	initialize: function(model, options){
		this.options = _.extend({}, this.options, options);
	},
	
	url: function() {
		return 'hope/users/occurrences';
	}
});


