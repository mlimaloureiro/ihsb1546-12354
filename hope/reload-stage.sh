pkill -9 -f runfcgi
python ./manage-stage.py runfcgi host=127.0.0.1 port=9000
