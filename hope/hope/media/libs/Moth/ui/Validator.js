Moth.ui.Grid.validator.Generic = function(tgrid){
	//_.bindAll(this, "initialize", "validate");
	this._gridRef = null
	this.initialize(tgrid)
}

_.extend(Moth.ui.Grid.validator.Generic.prototype, Backbone.Events, {
	initialize: function(tgrid){},
	validate: function(X, Y, nval, grid){}
})

// Set up inheritance for the model, collection, and view.
 Moth.ui.Grid.validator.Generic.extend = extend;