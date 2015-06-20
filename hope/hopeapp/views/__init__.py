#!/usr/bin/python
# -*- coding: utf-8 -*-

from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.template import RequestContext, loader
from django.shortcuts import redirect

from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
import simplejson as json
import datetime

from selenium import webdriver

# connecting to mongoDB
from pymongo import *
dbmongo = MongoClient(settings.MONGO_URL)
mongo = dbmongo.hope

def roadsredirect(request):
    return redirect('http://radiant-bayou-7646.herokuapp.com/')

def landingpage(request):
    opts = {}
    t = loader.get_template('landingpage.html')
    return HttpResponse(t.render(RequestContext(request, opts)))

def makedifference(request):
    opts = {}
    t = loader.get_template('makedifference.html')
    return HttpResponse(t.render(RequestContext(request, opts)))

def default(request):
    opts = {}
    t = loader.get_template('default.html')
    return HttpResponse(t.render(RequestContext(request, opts)))

def mobile_download(request):
    opts = {}
    t = loader.get_template('mobile_download.html')
    return HttpResponse(t.render(RequestContext(request, opts)))

def request_udid(request):
    result = {}
    result["success"] = "fail"
    if request.method == "POST":
        udid = request.POST["udid"]
        email = request.POST["email"]
        if len(udid) < 39:
            result["success"] = "notvalid"
            return HttpResponse(json.dumps(result), content_type="json")

        devices = mongo.deviceids.find({'udid': udid})
        if devices.count() > 0:
            result["success"] = "ok"
            return HttpResponse(json.dumps(result), content_type="json")

        mongo.deviceids.insert(
            {'udid': udid,
             'time': datetime.datetime.utcnow(),
             'email': email,
             'added': False})
        result["success"] = "success"
        return HttpResponse(json.dumps(result), content_type="json")
    else:
        result["success"] = "fail"
        return HttpResponse(json.dumps(result), content_type="json")

@csrf_exempt
def codebits_hook(request):
    try:
        driver = webdriver.PhantomJS()
        #email = request.POST['email']
        email = "andreslb1@gmail.com"
        driver.get("https://www.wallet.codebits.eu/login")
        driver.find_element_by_id('for_j_username').send_keys("gon@ovalerio.net")
        driver.find_element_by_id('for_j_password').send_keys("\q1w2e3r4t")
        driver.find_element_by_name('login').click()
        driver.get("https://www.wallet.codebits.eu/dashboard/transfer")
        driver.find_element_by_id('email').send_keys(email)
        driver.find_element_by_css_selector('input.bt-generic').click()
        driver.find_element_by_css_selector('input.bt-generic').click()
    except Exception as e:
        #f.write(json.dumps({'success':False, 'error_msg': str(e)}))
        return HttpResponse(json.dumps({'success':False, 'error_msg': str(e)}))
    else:
        return HttpResponse(json.dumps({"content":"nice"}))

def denied(request):
    return HttpResponse(json.dumps(
                    {'success': False,
                     'msg': 'Permission denied. No user auth.'}),
                    content_type="json")


def landing(request):

    # hard coded so we don't change user model

    if(request.user.is_authenticated()):
        if int(request.user.is_staff) != 1:
            return validate_password(request)
        else:
            return main(request)
    else:
        t = loader.get_template('main/landing_page.html')
        return HttpResponse(t.render(RequestContext(request, {})))


def validate_password(request):

    #
    #
    #
    #
    #	IS_STAFF IF BEING USED TO CHECK IF WE HAVE
    #	AN ACTIVE USER, NEED TO CHANGE THIS
    #
    #
    #
    #

    if request.user.is_authenticated():
        if request.method == "GET":

            t = loader.get_template('main/confirm_password.html')
            return HttpResponse(t.render(RequestContext(request, {})))
        elif request.method == "POST":

            if request.POST['password1'] == request.POST['password2'] \
            and request.POST['password1'] != '':
                request.user.set_password(request.POST['password1'])
                request.user.is_staff = 1
                request.user.save()

                return HttpResponseRedirect("/")
            else:
                return HttpResponseRedirect("/")
    else:
        return landing(request)


@login_required
def main(request):

    opts = {}

    if settings.INESC_ENV == 'DEVELOPMENT':
        opts['css_env_variable'] = 'css_dev'
        opts['js_env_variable'] = 'js_dev'
    else:
        opts['css_env_variable'] = 'css_all'
        opts['js_env_variable'] = 'js_all'

    if request.method == 'POST':
        requestData = request.POST.copy()
        opts['importData'] = requestData.get('importData', "")
    else:
        opts['importData'] = ""

    t = loader.get_template('base.html')

    return HttpResponse(t.render(RequestContext(request, opts)))


def register(request):
    #
    #
    #
    #
    #	IS_STAFF IF BEING USED TO CHECK IF WE HAVE
    #	AN ACTIVE USER, NEED TO CHANGE THIS
    #
    #
    #
    #

    if request.method == "POST":
        form = UserCreationForm(request.POST)

        if form.is_valid():
            emails = User.objects.filter(email = request.POST['email'])

            if len(emails) > 0:
                t = loader.get_template("main/register.html")
                return render(request,
                              "main/register.html",
                              {'email_error' : "Email already in use."})

            else:
                new_user = form.save()
                new_user.email = request.POST['email']
                new_user.is_staff = 1
                new_user.save()
                return HttpResponseRedirect("/")
        else:
            t = loader.get_template("main/register.html")
            return render(request, "main/register.html", {'form' : form})
    else:
        form = UserCreationForm()
        t = loader.get_template("main/register.html")

        return HttpResponse(t.render(
            RequestContext(request, {'form': form})))
