#!/usr/bin/python
# -*- coding: utf-8 -*-

import simplejson
from django.core import serializers
from django.http import HttpResponse
from django.contrib.auth.models import User
from hopeapp.models import Categories, Permissions, Attributes, \
    AttributeValue
from hopeapp.helpers.categories import *
from django.http import *
from hopeapp.responses.common_json import *
from django.contrib.auth.decorators import login_required

from hopeapp.services.category.category_service import *
from hopeapp.services.category.dependencies.formatter import *
from hopeapp.services.category.repository.django_repository import *
import datetime

# choose the repository dependency
cat_repository = CategoryDjangoORMRepository()
# create the formatter dependency
cat_formatter = CategoryJSONFormatter()
# instantiate a Service injecting dependencies
cat_service = CategoryService(category_repository=cat_repository, 
                            formatter = cat_formatter)

"""

-----------------------
Categories controller
-----------------------

NOTICE: In an OOP context, controllers shouldn't directly know 
        about the models and prepare data to return the response object.
        In a future code refactoring, we should create classes that 
        handle what is needed.

        Controllers tipically should be 5 lines long, receive a request and 
        provide the response.

"""

#@login_required(login_url='/denied/')

def list(request):
    """
        list(request)
        -------------------
        Description:        Return a list of all categories
        Url:                /hope/categories/
        Return:             HttpResponse Object
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:
            -

        FLOW:
            1. check authentication
            2. fetch all categories ordered by the `order` field
            3. serialize to json and return
    """

    resp = cat_service.get_all('order')
    return HttpResponse(resp, content_type='json')



@login_required(login_url='/denied/')
def create(request):
    """
        create(request)
        -------------------
        Description:        Create a new category
        Url:                /hope/categories/create/
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - Validate inputs

        FLOW:
            1. check authentication and check if it's an HTTP POST
            2. prepare the fields and get the user object related
            3. saves to sql db
            4. reorder the category
            5. add full permissions to the creator
    """
    if request.method == 'POST':
        params = {
            'parent_id' : request.POST.get('parent_id'),
            'user_id' : request.POST.get('user_id'),
            'name' : request.POST.get('name'),
            'description' : request.POST.get('description'),
            'menu_label' : request.POST.get('menu_label'),
            'bullshit' : request.POST.get('bullshit'),
            'order' : request.POST.get('order'),
            'updated_at': datetime.datetime.now()
        }
        resp = cat_service.create(params)
        return HttpResponse(resp, content_type='json')
    else:
        return HttpResponse(INVALID_REQUEST, content_type='json')
    
def childs(request, ident):
    """
        childs(request, ident)
        -------------------
        Description:        Get a list of {category id} child categories,
                            it's not recursive, only gets a level below
        Url:                /hope/categories/childs/{id}/
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            -

        FLOW:
            1. Simply access's the model and gets if category id provided
                exists
    """

    resp = cat_service.get_childs(ident)
    return HttpResponse(resp, content_type='json')

@login_required(login_url='/denied/')
def edit(request, ident):
    """
        edit(request, ident)
        -------------------
        Description:        Edits a category (name, description, menu_label, order)
        Url:                /hope/categories/edit/{id}/$
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - validate input
            - check if it's an HTTP post

        FLOW:
            1. check authentication
            2. prepare the fields
            3. saves to sql db
            4. reorder the category
    """
    if request.method == "POST":
        options = {}
        data = simplejson.loads(request.POST.get('fields'))
        options['data'] = data
        options['id'] = ident

        resp = cat_service.edit(options)

        return HttpResponse(resp, content_type="json")
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")

@login_required(login_url='/denied/')
def remove(request, ident):
    """
        remove(request, ident)
        -------------------
        Description:        Remove a category and all his childs
        Url:                /hope/categories/remove/{id}/$
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - Validate inputs
            - CSRF Protection
            - Instead of calling controllers method to
              remove the category it should call the class 
              responsible for it


        FLOW:
            1. check authentication
            2. check if the category we want to delete exists
            3. remove the category and all the childs in the tree
            4. reorder the category
            5. add full permissions to the creator
    """
    if request.method == "POST":
        resp = cat_service.remove(ident)
        return HttpResponse(resp, content_type='json')
    else:
        return HttpResponse(INVALID_REQUEST, content_type='json')

def schema(request, ident):
    """
        schema(request, ident)
        -------------------
        Description:        Returns the category schema so we can use it 
                            i.e. in forms
        Url:                /hope/categories/schema/{id}
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>,   
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            -

        FLOW:
            1. find the category we want
            2. find all parent categories attributes
            3. find attributes by category id
    """

    resp = cat_service.get_schema(ident)
    return HttpResponse(resp, content_type='json')

def field(request, ident):
    """
        field(request, ident)
        -------------------
        Description:        Adds fields to the category schema
        Url:                /hope/categories/field/{id}
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            -

        FLOW:
            1. check if it's an HTTP POST
            2. prepares the data
            3. traverse the fields data provided and adds the fields

    """

    
    if request.method == 'POST':
        data = simplejson.loads(request.POST.get('fields'))

        resp = cat_service.add_fields(ident, data)
        return HttpResponse(resp, content_type='json')
    
    else: 
        return HttpResponse(INVALID_REQUEST, content_type='json')


def remove_fields(request):
    """
        remove_fields(request)
        -------------------
        Description:        Remove fields from category schema
        Url:                /hope/categories/remove_fields/
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - check if deleting has write permissions

        FLOW:
            1. check if it's an HTTP POST
            2. find attribute.id corresponding to the field
            3. delete all instances of attribute-id in attributevalue table
            4. delete record from attributes table with attribute.id

    """

    if request.method == 'POST':
        list_ids = simplejson.loads(request.POST.get('ids'))
        options = {}
        options['list_ids'] = list_ids

        resp = cat_service.remove_fields(options)

        return HttpResponse(resp, content_type='json')
    else:
        return HttpResponse(INVALID_REQUEST, content_type='json')


def get(request, ident):
    """
        get(request, ident)
        -------------------
        Description:        Get category by id
        Url:                /hope/categories/id/
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - 

        FLOW:
            1. User category service to get the category

    """
    resp = cat_service.get(ident)
    return HttpResponse(resp, content_type='json')


def occurrences(request, ident):
    """
        occurrences(request, ident)
        -------------------
        Description:        Returns all occurrences of the category provided
        Url:                /hope/categories/occurrences/{id}
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - Change to /hope/categories/{id}/occurrences

        FLOW:
            1. user service to get the response
    """

    resp = cat_service.get_all_occurrences(ident)

    return HttpResponse(resp, content_type="json")


def edit_values(request, ident):
    """
        edit_values(request, ident)
        -------------------
        Description:        Edit attribute values
        Url:                /hope/categories/edit_values/{id})/
        Return:             HttpResponse Object          
        Author:             Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>
        Last Edited:        Miguel Loureiro <mlimaloureiro@outlook.com>, 
                            Andre Goncalves <andre@goncalves.me>

        TODO:   
            - 

        FLOW:
            1. prepare response data structures and check if it's an HTTP POST
            2. load posted fields
            3. edit fields and save
    """

    result = {}
    result["success"] = False

    if request.method == "POST":
        fields_edit = simplejson.loads(request.POST.get('fields'))
        options = {}
        options['fields'] = fields_edit
        resp = cat_service.edit_values(ident, options)
        
        return HttpResponse(resp, content_type="json")
    else:
        return HttpResponse(INVALID_REQUEST, content_type="json")
