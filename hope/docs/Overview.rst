Overview
====================================

Sperobox is a **distributed application** that makes use of different machines, which allow it to be scalable. It's also built on a variety of different technologies on which the team consider it offers the best production stack for the projects end.

The project follows strictly the **Separation of Concerns** (SoC) design principle which leads us to the need of having deep knowledge of *Software Design Patterns* and terms like, *frontend engineering*, *backend engineering*, *DRY*, *MVC*, *CORS*, etc... should be familiar to you.

=================
Physical Production Stack
=================

* **MAIN 	- moth.dec.uc.pt**
	Machine responsible to host the code that controls the application flow. 

* **BD 	- bdmoth.dec.uc.pt**
	Machine responsible to host the DBMS engines ( MongoDB and MySQL ). It is deeply connected to the main machine.

* **CDN	- webmoth.dec.uc.pt**
	Machine responsible to host the static contents of the application. HTML files, pictures, etc... are hosted in this machine.

=================
Technologies
=================

All servers are running on Debian linux distributions.

* **List of Backend services used in all machines**
	* nginx as HTTP server
	* Python as the scripting language
	* Django Framework 
	* PHP
	* MongoDB
	* MySQL
	* Git
	* Vagrant
	* Puppet
	* Sphynx

* **Frontend**
	* Javascript
	* Backbone.js
	* Underscore.js
	* jQuery.js
	* (other dependencies)


=================
Deployment
=================

Production deployment is made from a shell script that deeply uses git services. 
All the code is hosted on GitHub.

=================
Installation and Contribution
=================

To contribute to Sperobox development, you should *git clone* the project repository, **create the vagrant box** and run the provision provided in. After you have your development environment ready, you can start coding and submitting pull requests to the repository.


