class OccurrenceService():

    def __init__(self, occurrence_repository, formatter, options={}):

        self.repository = occurrence_repository
        self.formatter = formatter
        # we may have other services here
        self.options = options

    def get_all(self,
                request_user_id,
                order_by='created_at',
                validated=1
                ):

        query = {'validated': validated, 'bullshit': 0}
        obj = self.repository.filter(params=query, order_by=order_by)

        options = {'request_user_id': request_user_id}

        return self.formatter.output(obj, options)

    def get_all_by_category(self,
                            request_user_id,
                            category,
                            order_by='created_at',
                            validated=1
                            ):

        query = {'category_id': category,
                 'validated': validated,
                 'bullshit': 0
                 }

        obj = self.repository.filter(params=query, order_by=order_by)

        options = {'request_user_id': request_user_id}

        return self.formatter.output(obj, options)

    def get_all_by_user(self,
                        user,
                        created_at='created_at',
                        validated=1
                        ):
        pass

    def get_one(self, occurrence_id, request_user_id):

        # this should be in the formatter - request.user.id
        options = {'request_user_id': request_user_id}
        occ = self.repository.get(ident=occurrence_id, options=options)

        if len(occ) == 0:
            return False

        attributes = self.repository.get_custom_attributes(
                            occ_id = occurrence_id)
        photos = self.repository.get_photos(occ_id = occurrence_id)
        videos = self.repository.get_videos(occ_id = occurrence_id)

        obj = {	'default_values'	: occ['default_values'],
                'schema_values'		: attributes,
                'geo'				: occ['geo'],
                'geom'				: occ['geom'],
                'photos'			: photos,
                'videos'            : videos
            }

        return self.formatter.output(obj, {'single': True})

    # values = {}
    def create(self, inputs = {}):

        obj = {
            'category_id' : inputs['category_id'],
            'title'       : inputs['title'],
            'description' : inputs['description'],
            'user'        : inputs['user'],
            'coordinate'  : inputs['coordinate'],
            'validated'   : inputs['validated'],
            'vote_counter': inputs['vote_counter'],
            'created_at'  : inputs['created_at'],
            'updated_at'  : inputs['updated_at'],
            'bullshit'    : inputs['bullshit'],
        }

        occ = self.repository.create(obj)
        return self.formatter.output(occ, {'single': True})

    def initialize_attributes(self, occ_id, category_id):

        return self.repository.initialize_attributes(occ_id = occ_id, 
                                                     category_id = category_id)

    def initialize_permissions(self, occ_id):

        return self.repository.initialize_permissions(occ_id)
