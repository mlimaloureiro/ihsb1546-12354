#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.views.decorators.csrf import csrf_exempt
from hopeapp.models import *
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
import simplejson

def remove_childs(list_childs):
    """
        remove_childs(request, list_childs)
        -------------------
        Description:        This is an helper function of the remove()
        Url:                -
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - delete this controller method

        FLOW:
            1. check authentication
            2. traverse the child list provided and remove them recursively
    """

    for child in list_childs:
        childofchild = Categories.objects.filter(parent_id=child.id)
        if len(childofchild) > 0:
            remove_childs(childofchild)
        remove_category(child)

def remove_category(cat):
    """
        remove_childs(request, list_chields)
        -------------------
        Description:        This is an helper function of the remove()
        Url:                - 
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - delete this controller method

        FLOW:
            1. check authentication
            2. delete all attributes from the category we want to delete
    """
    attributes = Attributes.objects.filter(category=cat)
    for attr in attributes:
        attr_value_list = AttributeValue.objects.filter(attribute=attr)
        attr_value_list.delete()
    attributes.delete()

    permissions = Permissions.objects.filter(category=cat.id)
    permissions.delete()

    cat.delete()

@csrf_exempt
def find_parent_fields(ident, fields, parents):

    try:
        cat = Categories.objects.get(id=ident)
        if cat.parent_id == 0:
            return True, fields, parents
        else:
            parent = Categories.objects.get(id=cat.parent_id)
            parents.append({"name": parent.menu_label, "id": cat.parent_id})

            attrset = parent.attributes_set.all()

            # get all parent attributes

            for a in attrset:
                attribute = {
                    'id': a.id,
                    'category_id': a.category_id,
                    'name': a.name,
                    'order': a.order,
                    'a_type': a.a_type,
                    'max_value': a.max_value,
                    'min_value': a.min_value,
                    'scale': a.scale,
                    'data_type': a.data_type,
                    'nullable': a.nullable,
                    'visible': a.visible
                }

                # append each one in the fields array

                fields.append(attribute)

            return find_parent_fields(cat.parent_id, fields, parents)
    except Categories.DoesNotExist:
        return False, [], []


# Add new field to category
#

def add_field(cat_id, field):
    cat = Categories.objects.get(id=cat_id)
    name = field['name']
    order = field['order']
    a_type = field['a_type']
    max_value = field['max_value']
    min_value = field['min_value']
    scale = field['scale']
    data_type = field['data_type']
    nullable = field['nullable']
    visible = field['visible']
    a = Attributes.objects.create(
        category=cat,
        name=name,
        order=order,
        a_type=a_type,
        max_value=max_value,
        min_value=min_value,
        scale=scale,
        data_type=data_type,
        nullable=nullable,
        visible=visible
    )
    return a.id


# Remove field from category

def remove_field(ident):
    try:
        attr = Attributes.objects.get(id=ident)
        attr_value_list = AttributeValue.objects.filter(attribute=attr)
        attr_value_list.delete()
        attr.delete()
        return True
    except (Attributes.DoesNotExist, AttributeValue.DoesNotExist), e:
        return False


def change_category_order(order, parent_id, cat_id):
    test = Categories.objects.filter(order=order, parent_id=parent_id)

    if(test.exists()):
        right = Categories.objects.filter(
            order__gte=order, parent_id=parent_id)

        for cat in right:
            cat.order += 1
            cat.save()

    category = Categories.objects.get(id=cat_id, parent_id=parent_id)
    category.order = order
    category.save()

    return True


def change_attribute_order(order, cat_id, attr_id):
    category = Categories.objects.get(category=cat_id)
    test = Attributes.objects.filter(order=order, category=category)

    if(test.exists()):
        right = Attributes.objects.filter(
            order__gte=order, category=category)

        for attr in right:
            attr.order += 1
            attr.save()

    attribute = Attributes.objects.get(id=cat_id, category=category)
    attribute.order = order
    attribute.save()

    return True


def get_childs(category):
    childs = Categories.objects.filter(parent_id=category.id)
    return childs


def get_all_childs(category, childs):
    cat_childs = get_childs(category)
    childs.extend(cat_childs)

    for child in cat_childs:
        get_all_childs(child, childs)

    return childs
