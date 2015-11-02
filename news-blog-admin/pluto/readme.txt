Installation:
1.Create mysql database:pluto with account:pluto/pluto
    CREATE DATABASE IF NOT EXISTS pluto DEFAULT CHARSET utf8 COLLATE utf8_general_ci;
    GRANT ALL PRIVILEGES ON pluto.* TO 'pluto'@'localhost' IDENTIFIED BY 'passw0rd';

2.pip install django, pillow, djangorestframework, django-ckeditor, 
  sudo apt-get install python-mysqldb

3.goto project root folder pluto/ and run below command:

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser #if need to create a super admin user
python manage.py collectstatic
python manage.py runserver


