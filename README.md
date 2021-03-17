# Villains Online

> My covid-19 project! My game group missed being able to get together to play our self created board game Villains. So I decided to bring it to the web so we could keep playing while staying safe.

Visit the live site:
https://playvillains.jeremykalgreen.com

Villains is a board game for 3-5 players in which players take on the role of a villainous faction attempting to take over The City. Place your hidden action tokens in the city in a devilish attempt to complete your secret plans.  

Since this site was created to allow my game group to keep playing during the pandemic it assumes the users are already familiar with how to play Villains, and thus doesn't include any sort of tutorials (yet). But you can read the full game rules [here](public/files/villains_full_rules.pdf). 

![](public/images/readme/details.jpg)


## Built With
* Laravel
* Vue
* Node
* Express
* Socket.io

## Prerequisites

* PHP 7.4
* MySQL 8
* Composer
* Node

## Installation

Clone the repository

    git clone https://github.com/amorphia/villains-online.git

Switch to the repository's folder

    cd villains-online

Install php dependencies using composer

    composer install
    
Install node dependencies using NPM

    npm install
    
Copy the example env file and update its contents to suit your local environment (most importantly set up a local database and configure it within your .env)

    copy .env.example .env

Generate an application key

    php artisan key:generate

Run the database migrations

    php artisan migrate
    

Start the local http server

    php artisan serve
    
Open a new command line and navigate to the game server's folder

    cd villains-online/server
    
Start the local node game server

    node server.js    

#### Avoiding localhost CORS issues

Chances are you will need to tell your browser to allow the http server and game server to talk to each other, as most modern browsers block communication from one port to another on localhost (and don't follow the usual CORS header instructions when on localhost). You can read more about the problem [here](https://medium.com/swlh/avoiding-cors-errors-on-localhost-in-2020-5a656ed8cefa).  

My solution for chrome on Windows is to call up the Windows Run Dialog (Windows key + R) and run Chrome with the --disable-web-security flag set.

    chrome.exe --user-data-dir="c:/tmp/chrome_dev" --disable-web-security 
       
But there are a number of other possible solutions that, again, you can read about [here](https://medium.com/swlh/avoiding-cors-errors-on-localhost-in-2020-5a656ed8cefa)

#### Installation complete 

You can now access villains-online at http://localhost:8000 

Of course since villains online is a multiplayer game you'll need to run at least two parallel sessions to really poke around very far. The easiest way I've found to do that is to use the [SessionBox](https://chrome.google.com/webstore/detail/sessionbox-multi-login-to/megbklhjamjbcafknkgmokldgolkdfig?hl=en) extension for Chrome. 

## Project Status

This is still very much a work in progress, but I have a few things I'm really looking to tackle soon:
* Add tutorials and information for new players
* Add informational popups to basically everything on right click
* Add a spectator mode to allow guests to view a game in progress
* Fix a number of UI/UX issues
* Minor gameplay bugs



## About Me

* Jeremy Kalgreen 
* [@amorphiaapparel](https://twitter.com/amorphiaapparel)
* jeremy@jeremykalgreen.com
* [https://github.com/amorphia](https://github.com/amorphia)

