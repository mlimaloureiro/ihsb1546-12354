from hopeapp.models import *


def user_is_following(follower, followed):
    test = UserFollow.objects.filter(follower=follower, followed=followed)
    return test.exists()
