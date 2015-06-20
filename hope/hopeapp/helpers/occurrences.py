from hopeapp.models import *


def has_write_permission(occurrence, user):
    try:
        perm = PermissionsOccurrences.objects.get(
            occurrence=occurrence, user=user)
        return perm.write
    except PermissionsOccurrences.DoesNotExist:
        return 0


def is_following(occurrence, user):
    test = OccurrencesReforce.objects.filter(
        occurrence=occurrence, user=user)
    return test.exists()


def is_owner(occurrence, user):
    test = Occurrences.objects.filter(id=occurrence, user=user)
    return test.exists()


def has_permission_record(occurrence, user):
    perm = PermissionsOccurrences.objects.filter(
        occurrence=occurrence, user=user)
    return perm.exists()
