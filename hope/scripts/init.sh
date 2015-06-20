# SETUP

# install dependencies, this can be removed because it’s in the newly created box created
# sudo apt-get install python-pip
# sudo apt-get install libmysqlclient-dev
# sudo apt-get install python-dev
# sudo apt-get install htop
# sudo apt-get install iftop

# create directories for other machines env
sudo mkdir /var/www/cdn
sudo chmod -R /var/www/cdn
sudo mkdir /var/www/cdn/hope
sudo mkdir /var/www/cdn/hope/photos
# go to root folder
cd /var/www

# fetch the project to the root
https://github.com/andreesg/hope.git

# go to directory were we have the dependencies list
cd /var/www/hope

# update easy_install
easy_install -U distribute

# install dependencies
sudo pip install -r dependencies.txt

# migrate the database

# seed the database

# configure nginx
sudo rm -R /etc/nginx/conf.d
sudo cp -R /var/www/hope/configurations/nginx/conf.d /etc/nginx/conf.d/conf.d
sudo service nginx restart
