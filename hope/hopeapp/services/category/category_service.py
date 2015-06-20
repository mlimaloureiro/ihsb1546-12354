class CategoryService():

    def __init__(self, category_repository, formatter, options={}):

        self.repository = category_repository
        self.formatter = formatter
        # we may have other services here
        self.options = options

    def get(self, cat_id):
    	
        category = self.repository.get(ident=cat_id)
    	options = {}
        options['single'] = True

    	return self.formatter.output(category, options)

    def get_all(self, order_by):

        query = {'order_by':order_by}

        categories = self.repository.get_all(query)
    	options = {}

    	return self.formatter.output(categories, options)

    def create(self, inputs={}):
    	
    	# create obj from inputs
    	# create options
        obj = {
            'parent_id': inputs['parent_id'],
            'user_id': inputs['user_id'],
            'name': inputs['name'],
            'description': inputs['description'],
            'menu_label': inputs['menu_label'],
            'bullshit': inputs['bullshit'],
            'order': inputs['order'],
            'updated_at': inputs['updated_at']
        }

        category = self.repository.create(obj)

        options = {}
        options['single'] = True

        if category['success']:
            options['msg'] = "Successfully created a new category."
        else:
            # TODO
            # remove and fix
            options['msg'] = category['error_msg']

    	return self.formatter.output(category, options)

    def get_all_occurrences(self, ident):
        options = {}
        occurrences = self.repository.get_all_occurrences(ident)
        return self.formatter.output(occurrences, options)

    def edit(self, options={}):
        cat_id = options['id']
        data = options['data']
        obj = self.repository.edit(cat_id, data)
    	return self.formatter.output(obj, {'single': True})


    def get_childs(self, ident):
        obj = self.repository.get_childs(ident)
        return self.formatter.output(obj)

    def remove(self, ident):
        obj = self.repository.remove(ident)
    	return self.formatter.output(obj, {'single': True})

    def get_schema(self, ident):

        obj = self.repository.get_schema(ident)
        
        return self.formatter.output(obj, {'single': True})

    def edit_values(self, ident, options={}):
        fields = options['fields']

        obj = self.repository.edit_values(ident, fields)

        return self.formatter.output(obj, {'single': True})

    def remove_fields(self, options={}):

        ids = options['list_ids']
        obj = self.repository.remove_fields(ids)

        return self.formatter.output(obj, {'single': True})

    def add_fields(self, ident, options={}):
        data = options['data']
        
        obj = self.repository.add_fields(ident, data)

        return self.formatter.output(obj, {'single': True})

