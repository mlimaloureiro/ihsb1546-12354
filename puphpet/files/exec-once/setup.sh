# SETUP

# install dependencies, this can be removed because it’s in the newly created box created
# sudo apt-get install python-pip
# sudo apt-get install libmysqlclient-dev
# sudo apt-get install python-dev
# sudo apt-get install htop
# sudo apt-get install iftop

# create directories for other machines env
# sudo mkdir /var/www/cdn
# sudo mkdir /var/www/cdn/hope
# sudo mkdir /var/www/cdn/hope/photos
# sudo chmod -R 777 /var/www/cdn 
# sudo chmod -R 777 /var/www/logs

# go to root folder
cd /var/www

# fetch the project to the root
#sudo git clone https://github.com/andreesg/hope.git

# go to directory were we have the dependencies list
cd /var/www/hope

# update easy_install
easy_install -U distribute

# install dependencies
sudo pip install -r dependencies.txt

# configure nginx and php5-fpm for cdn
sudo rm -R /etc/nginx/conf.d
sudo cp -R /var/www/hope/configurations/nginx/conf.d /etc/nginx/conf.d

sudo rm -R /etc/php5/
sudo cp -R /var/www/hope/configurations/php5-fpm/php5 /etc/php5

# sudo mkdir /var/www/logs/hope/
# touch /var/www/logs/hope/nginx-access.log
# touch /var/www/logs/hope/nginx-error.log
sudo service php5-fpm restart

sudo service nginx restart

# seed database
mysql -u hope --password=extintor hope < /var/www/sqldump/default.sql

cd /var/www/hope

# sync
python manage.py syncdb

# sync migrations
python manage.py migrate hopeapp 0001 --fake
python manage.py migrate hopeapp 

# start fpm
sh reload.sh
