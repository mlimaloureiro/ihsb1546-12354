var HopeUser = Backbone.Model.extend({
	name: 'hopeuser',

	addOccurrencesFollowing: function(id) {
		this.get('occurrences_following').push({'id' : parseInt(id)});
		//console.log('Added occurrence to HopeUser model.');
	},

	removeOccurrencesFollowing: function(ident) {
		var id = parseInt(ident);

		for(index in this.get('occurrences_following')) {
			if(this.get('occurrences_following')[index].id == id) {
				this.get('occurrences_following').splice(index, 1);
			}
		}

		//console.log('Removed occurrence from HopeUser model.');

	},

	addFollowing: function(ident) {
		var id = parseInt(ident);
		this.get('following').push({'id' : parseInt(id)});
		//console.log('Added following to HopeUser model.');
	},

	removeFollowing: function(ident) {
		var id = parseInt(ident);

		for(index in this.get('following')) {
			if(this.get('following')[index].id == id) {
				this.get('following').splice(index, 1);
			}
		}

		//console.log('Removed occurrence from HopeUser model.');
	},

	isFollowingUser: function(ident) {
		var id = parseInt(ident);
		var following = this.get('following');

		for(index in following) {
			if(following[index].id == id) {
				return 1;
			}
		}

		return 0;
	},

	isFollowingReport: function(ident) {
		var id = parseInt(ident);

		var following = this.get('occurrences_following');

		for(index in following) {
			if(following[index].id == id) {
				return true;
			}
		}

		return false;
	}

});