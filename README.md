# Eat Columbus

> A personal project I made to help me and my significant other keep track of what restaurants in Columbus Ohio we both like, or want to try, and then find matches between our lists. Intended to help streamline the sometimes laborious process of trying to decide where we both want to eat. 

Visit the live site:
https://eat.jeremykalgreen.com

Eat Columbus uses the Yelp API to list all of the restaurants in Columbus Ohio, and allows users to quickly flag the restaurants they want to try and rate those that they have already visited. Once you've rated or flagged some restaurants you can compare your list to another users and find out what places you are both itching to try, or love. 

Comb through restaurants with a list view, or swipe through a a Tinder-esque interface. 

List View             |  Swipe View
:-------------------------:|:-------------------------:
![](public/images/readme/list.jpg)  |  ![](public/images/readme/details.jpg)



## Built With
* Laravel
* Laravel Sanctum 
* Vue
* Yelp API

## Prerequisites

* PHP 7.4
* PHP Imagick Extension
* MySQL 8
* Composer
* NPM

## Installation

Clone the repository

    https://github.com/amorphia/eat.git

Switch to the repository's folder

    cd eat

Install php dependencies using composer

    composer install
    
Install node dependencies using NPM

    npm install
    
Copy the example env file and update its contents to suit your local environment (most importantly set up a local database and configure it within your .env)

    cp .env.example .env

Generate an application key

    php artisan key:generate

Run the database migrations

    php artisan migrate
    
Seed the database

    php artisan db:seed

Start the local development server

    php artisan serve

You can now access the server at http://localhost:8000

## Project Status

Woof, this is still very much a work in progress, but a few things a re floating to the top of my to-do list:
* Fix some UI/UX issues that still linger
* Add more instructional tours for various parts of the site
* Add ability to compare more than two people (or at least match two people that aren't you)
* Add a friend system to limit who can view your matches (and clean up the choose match select)


## About Me

* Jeremy Kalgreen 
* [@amorphiaapparel](https://twitter.com/amorphiaapparel)
* jeremy@jeremykalgreen.com
* [https://github.com/amorphia](https://github.com/amorphia)

