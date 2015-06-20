import simplejson as json


DOES_NOT_EXIST = json.dumps({
	'success': False, 
	'msg': 'Does not exist.'
})

PERMISSION_DENIED = json.dumps({
	'success': False, 
	'msg': 'Permission denied.'
})

INVALID_REQUEST = json.dumps({
	'success': False, 
	'msg': 'Invalid request.'
})

SUCCESS = json.dumps({
	'success': True, 
	'msg': 'Operation successfully done.'
})

### FOLLOW

NO_FOLLOWERS = json.dumps({
	'success': False, 
	'msg': 'No followers.'
})

FOLLOW_SUCCESS = json.dumps({
	'success': True, 
	'msg': 'Following.'
})

UNFOLLOW_SUCCESS = json.dumps({
	'success': True, 
	'msg': 'Not following anymore.'
})

UNFOLLOW_ERROR = json.dumps({
	'success': True, 
	'msg': 'Not following.'
})

FOLLOW_ALREADY = json.dumps({
	'success': False, 
	'msg': 'Already following.'
})

