<h1>About this Odyssey Tours repository</h1>

<p>
Odyssey Tours is the repository for the website of Odyssey Tours & Travels Pvt Ltd in India based on the fabulous <a href="https://gohugo.io/" target="_new">Hugo</a> web page generator and plain vanilla Javascript. 
</p>

## Installation

```
$ git clone ourmaninindia.github.com/odyssey-tours
```

## Configuration

The configuration settings are in config.toml 

Private variables are stored in .env which you would have to create yourself e.g. the googleAPI key

## Start the server

Start the main Hugo server

```
hugo server --renderToDisk
```

## App
Most of the essential configurations are in the app.js file which you can find in the root. 

You most likely need additional Node modules. See the package.json file for a listing of all of them.

Start the app server using a new terminal window

```
node app.js
```

## references
[Hugo](https://gohugo.io/) is one of the most popular open-source static site generators. With its amazing speed and flexibility, Hugo makes building websites fun again.

