Sperobox
======

This repository is the Sperobox web application it is developed with [Django](https://www.djangoproject.com/)
and will be configured through [puppet](http://puppetlabs.com/).

It lives on http://sperobox.com


Setup -- in construction
==========

**Dependencies:**
 - [VirtualBox 4.3.2](http://download.virtualbox.org/virtualbox/4.3.2/)
 - [Vagrant 1.3.5](http://downloads.vagrantup.com/tags/v1.3.5)
 - more ..

```
$ git clone git@github.com:andreesg/hope.git
$ cd hope
$ vagrant up
$ vagrant ssh
$ cd /vagrant
$ sudo ./configure.sh
$ ./start.sh

```

Point spero.dev to 10.0.0.200 in your /etc/hosts file.
Point your browser to [http://spero.dev/](http://spero.dev/), you should have your development env ready.

---

Coding Standards
================

Python
----------

TODO


JavaScript
----------

JavaScript code *must* be es5 compliant and validated by jshint.

With sublime text you can have automatic jshint validation on
`Preferences > Package Settings > SublimeLinter > Settings User`
the default jshint configuration is located in `.jshintrc`


```json
{
    "sublimelinter": "load-save",
    "javascript_linter": "jshint"
}
```

---


Deploying
=========

A script will be provided to deploy the current working state to the server.

---

Copyright © iKreation 2013
