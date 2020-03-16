const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
/* - MONGO CONSTANT */
const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const mongoURL = "mongodb://localhost:27017/";
const client = MongoClient(mongoURL,{ useUnifiedTopology: true });
const dataBaseName = "pyoa";

/**
* @desc : Check if application is available.
*/
router.get('/', (req, res) => {
  res.send({
	  "status" : "success",
	  "message" : 'API is operational. Have a good game backpacker.'
  	});
});

/**
* @desc : Check if the application communicate properly with the mongoDB
*/
router.get('/db_status',(req,res) => {

	client.connect(function(err) {
		if (err)
			res.send({"status" : "error","message" : 'API cant access to the mongo database.'});

		else
			res.send({"status" : "success","message" : 'API is connecting with mongo database.'});
	 });
});

/**
* @desc : Get back the informations about a specific user.
* @option : join - Add more informations about artefact, creature or ressources.
	* @value : owned_artefacts, owned_creatures or/and owned_ressources
	* @format : ?join=option1;option2
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
router.get('/user/:userid', (req, res,next) => {
	//Get ID
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the informatiosn about "+ id +".");
	//Exclusion
	var exclude = { "projection" :{
		'owned_artefacts':0,
		'owned_creatures' : 0,
		'owned_ressources' :0
	}};

	//Delete the join elements from the exclude object
	let join = req.query.join;
	if(join){
		var tojoin = join.split(';');
		for(let j=0;j<tojoin.length;j++)
			delete exclude["projection"][tojoin[j]];
	}

	//Check if user uses id or name
	let useName = req.query.usename;
	if(useName=="true")
		var toFind = {"name":id};
	else{
		try{var o_id = new mongo.ObjectID(id);}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
		var toFind = {"_id":o_id}
	}
	//Request informations
	mongoFind_Exclude("users",toFind,exclude,res);
});

router.get('/user/:userid/creature', (req, res,next) => {
	let id = req.params.userid;

	var exclude = { "projection" :{
		'current_energy':0,
		'max_energy' : 0,
		'current_artefact' :0,
		'owned_ressources' :0,
		'owned_artefacts' :0,
		'is_admin' :0,
	}};

	//Check if user uses id or name
	let useName = req.query.usename;
	if(useName==true)
		var toFind = {"name":id};
	else{
		try{var o_id = new mongo.ObjectID(id);}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
		var toFind = {"_id":o_id}
	}
	//Request informations
	mongoFind_Exclude("users",toFind,exclude,res);
});

/* POST */
router.post('/user/:userid/creature', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [POST] => Try to summon a creatures for "+ id +".");
	let tmpBdy = req.body;
	res.send({"status":"success","userid":id,"creatures":"Miaou !","s_object":tmpBdy});
});

router.get('/user/:userid/ressource', (req, res,next) => {
	//Get ID
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the ressources of "+ id +".");
	//Prepare exclusion
	var exclude = { "projection" :{
		'current_energy':0,
		'max_energy' : 0,
		'current_artefact' :0,
		'owned_creatures' :0,
		'owned_artefacts' :0,
		'is_admin' :0,
	}};
	//Check if user uses id or name
	let useName = req.query.usename;
	if(useName==true)
		var toFind = {"name":id};
	else{
		try{var o_id = new mongo.ObjectID(id);}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
		var toFind = {"_id":o_id}
	}
	//Request informations
	mongoFind_Exclude("users",toFind,exclude,res);
});


router.get('/user/:userid/artefact', (req, res,next) => {
	//Get ID
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the artefacts of "+ id +".");
	//Prepare exclusion
	var exclude = { "projection" :{
		'current_energy':0,
		'max_energy' : 0,
		'current_artefact' :0,
		'owned_creatures' :0,
		'owned_ressources' :0,
		'is_admin' :0,
	}};
	//Check if user uses id or name
	let useName = req.query.usename;
	if(useName==true)
		var toFind = {"name":id};
	else{
		try{var o_id = new mongo.ObjectID(id);}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
		var toFind = {"_id":o_id}
	}
	//Request informations
	mongoFind_Exclude("users",toFind,exclude,res);
});


router.get('/ressource', (req, res,next) => {
	console.log("[INFO] - [GET] => Try to get back the ressources from the system.");
	// Prepare the request to ask
	var toFind = {}
	var toFind_rare = {};
	var toFind_name = {};
	//TO ADD IN DOC
	let add_rarity = req.query.rarity;
	let add_name = req.query.name;

	if(add_rarity)
		toFind_rare = {"rarity":add_rarity};

	if(add_name)
		toFind_name = {"name" : new RegExp(add_name)};

	Object.keys(toFind_rare).forEach(key => toFind[key] = toFind_rare[key]);
	Object.keys(toFind_name).forEach(key => toFind[key] = toFind_name[key]);

	//Request informations
	mongoFind_Exclude("ressources",toFind,{},res);
});


router.get('/creature', (req, res,next) => {
	console.log("[INFO] - [GET] => Try to get back the creature from the system.");
	// Prepare the request to ask
	var toFind = {}

	//TO ADD IN DOC
	let add_name = req.query.name;
	if(add_name)
		toFind = {"name" : new RegExp(add_name)};

	//Request informations
	mongoFind_Exclude("creatures",toFind,{},res);
});


router.get('/creature/:creatureid', (req, res,next) => {
	//GET ID
	let id = req.params.creatureid
	console.log("[INFO] - [GET] => Try to get back the creature : "+id+".");

	//Check if user uses id or name
	let useName = req.query.usename;
	if(useName=='true')
		var toFind = {"name":id};
	else{
		try{var o_id = new mongo.ObjectID(id);}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
		var toFind = {"_id":o_id}
	}
	//Request informations
	mongoFind_Exclude("creatures",toFind,{},res);
});

router.get('/artefact', (req, res,next) => {
	console.log("[INFO] - [GET] => Try to get back the artefacts from the system.");
	// Prepare the request to ask
	var toFind = {}

	//TO ADD IN DOC
	let add_name = req.query.name;
	if(add_name)
		toFind = {"name" : new RegExp(add_name)};

	//Request informations
	mongoFind_Exclude("artefacts",toFind,{},res);
});


router.get('/artefact/:artefactid', (req, res,next) => {
	let id = req.params.artefactid
	console.log("[INFO] - [GET] => Try to get back the artefact : "+id+".");

	//Check if user uses id or name
	let useName = req.query.usename;
	if(useName=='true')
		var toFind = {"name":id};
	else{
		try{var o_id = new mongo.ObjectID(id);}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
		var toFind = {"_id":o_id}
	}
	//Request informations
	mongoFind_Exclude("artefacts",toFind,{},res);
});

router.get('/artefact/:artefactid/owners', (req, res,next) => {
	let id = req.params.artefactid
	id = decodeURIComponent(id)
	console.log("[INFO] - [GET] => Try to get back the owners of the artefact : "+id+".");

	//Check if user uses id or name
	let useName = req.query.usename;
	//If name we can request directly
	if(useName=='true')
		getOwners("artefacts",id,res);
	//We need get back the name
	else{
		try{
			var o_id = new mongo.ObjectID(id);
			getOwnersByID("artefacts",o_id,res);
		}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
	}
});




app.use(bodyParser.json());
app.use(router);

app.listen(3000, err => {
  if (err) {
    process.exit(1);
    return;
  }
  console.log(`
    ################################################
    🛡️  Server listening on port: 3000 🛡️
    ################################################
  `);
});


function mongoFind_Exclude(name_collection,o_find,o_exclude,res){

	var toFind = o_find;
	var exclude = o_exclude;

	client.connect(function(err, client) {
		//Fail
		if (err)
			res.send({"status" : "error","message" : 'API cant access to the mongo database.'});
		//Success
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection(name_collection);
			collection.find(toFind,exclude).toArray(function(error,documents){
				if(err) throw error;
				res.send(documents)
			});
		}
	 });
}


function getOwners(name_collection,item,res){
	var exclude = { "projection" :{
		'current_energy':0,
		'max_energy' : 0,
		'current_artefact' :0,
		'owned_creatures' :0,
		'owned_ressources' :0,
		'owned_artefacts' :0,
		'is_admin' :0,
	}};

	var str_collection = "owned_" + name_collection
	var toFind = {};
	toFind[str_collection] = {$in : [item]}

	var allMatchingOwner = {}

	client.connect(function(err, client) {
		//Fail
		if (err)
			return;
		//Success
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection("users");
			collection.find(toFind,exclude).toArray(function(error,documents){
				if(err) throw error;
				res.send(documents)
				allMatchingOwner = documents;
			});
		}
	 });
}

function getOwnersByID(collection_name,o_id,res){

	str_return = "None";
	exclude = {}
	toFind = {"_id":o_id}

	let test = client.connect(function(err, client) {
		//Fail
			if (err)
				return;
			//Success
			else{
				let db = client.db(dataBaseName);
				let collection = db.collection(collection_name);
				collection.find(toFind,exclude).toArray(function(error,documents){
					if(err){ throw error; }
					else{
						this_name = documents[0].name;
						getOwners(collection_name,this_name,res);
					}
			});
		}
	});
}
