// Import file system structure from git

// new lamp server (aws is nice)
sudo apt-get upgrade
sudo apt-get update
sudo apt install tasksel
sudo tasksel install lamp-server

// Remove www and replace with console from git
cd /var/
sudo rm -r www
sudo git clone https://github.com/PubblyDevelopment/console-2018.git
sudo mv console-2018 www

// Import database

sudo mysql -u root -p
CREATE DATABASE console;
CREATE USER 'console'@'localhost' IDENTIFIED BY 'PutPasswordHere';
grant all privileges on console.* to 'console'@'localhost'
flush privileges;
exit;

sudo mysql -u root -p console < sql/freshBuild.sql



// Moving over config files

cd /var/www/html/
sudo nano config_default.php
(change password on line 4 to whatever you want)
sudo mv config_default.php config.php


Get python up and running

sudo apt-get install python3
sudo vim /etc/apache2/conf-available/cgi-enabled.conf
    <Directory "/var/www/html/py">
        Options +ExecCGI
        AddHandler cgi-script .cgi .py
    </Directory>
sudo a2enconf cgi-enabled
sudo service apache2 restart

// Server is ready

Strongly advice that you change the root password to something secure, that you disallow the following of system indexes, and other things.