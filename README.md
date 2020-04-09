PY.OA
=====

(Prog Your Own Adventure)
-------------------------

Summary
-------

<!--ts-->

-	[PY.OA](#pyoa)
	-	[Summary](#summary)
	-	[Requirements](#requirements)
	-	[Description](#description)
	-	[Launch the application with docker](#launch-the-application-with-docker)
		-	[&gt; Run the app](#-build-the-node-image)
		-	[&gt; Build the node image.](#-build-the-node-image)
		-	[&gt; Check the app status](#-check-the-app-status)
		-	[&gt; Cluster deployment](#-cluster-deployment)
	-	[Launch the application without Docker](#launch-the-application-without-docker)
		-	[&gt; Run the app](#-run-the-app)
	-	[Tests](#tests)
	-	[Documentation](#documentation)

<!--te-->

Requirements
------------

The following commands will be use for the application :

-	Docker
-	kubectl
-	kompose

And... that's all. Yes, cause this is the Docker power !

Description
-----------

This application contains two components : a backend write in ***nodeJS*** and the database wich is a ***mongodb***.

> And where is the front ?

Good question my friend ! This is your job to build a great front. Get the langage of your choice, follow the documentation and become the best explorer !

Launch the application with docker
----------------------------------

### > Build the node image.

Run the following script : `./install.sh`

### > Run the app

-	Run the following script : `sudo docker-compose up -d`.
-	MongoDB will run in the port : **27017**
-	Backend to submit your request run in the port : **3000**\.

### > Check the app status

Run the following script : `sudo docker-compose ps`. The two components should appear with "Up" mention.

### > Cluster deployment

For create the deployment files :

-	You need to install "kompose" with the following command : `sudo snap install kompose`.
-	Run the following commande : `kompose convert`.
-	Then your deployment is ready : `kubectl apply -f [CONF-FILES] -n [userID]`.

Launch the application without Docker
-------------------------------------

### > Run the app

Well, if you don't want use docker you'll have to find a mongoDB cluster or install a module in your environment. You can load the database with the informations contain in the directory ***"mongo-scripts"***.

You can always run the backend with the following this procedure :

-	Install **nodeJS** and **npm**.
-	***(OPTIONAL)*** Install **nodemon**.
-	In the terminal, in the **back** directory enter : `npm install`.
-	Launch the application with : `node back/index.js` or `nodemon back/index.js`.
-	Try to access to the following URL (GET) : ***http://localhost:3000/***.
-	If you get a response, you're ready to go !

Tests
-----

You can run the basics tests to check if the application is properly installing.

Please install "**Postman**" in your system and import the file : `back/PY.OA.postman_collection.json`.

Documentation
-------------

If you want consult the documentation of the API, please visit the following link : https://app.swaggerhub.com/apis/Drainman/AP_MYOA/1.0.0#/
