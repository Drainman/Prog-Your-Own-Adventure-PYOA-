/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/*							CONST & MODULE JSON								*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/

const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
var Validator = require('jsonschema').Validator;
var validate = require('jsonschema').validate;
/* - MONGO CONSTANT */
const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const mongoURL = "mongodb://localhost:27017/";
const client = MongoClient(mongoURL,{ useUnifiedTopology: true });
const dataBaseName = "pyoa";


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/*								SCHEMA JSON									*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/

const sh_creatures_artefacts  = {
	"type" : "object",
	"properties": {
		"name": {"type": "string"},
		"description" :{"type": "string"},
		"requirement": {
			"type" : "array",
			"minItems": 1,
			"items" : {
				"type" : "object",
				"properties" : {
					"name" : {"type" : "string"},
					"qty" : {"type" : "integer"}
				},
				"required" : ["name","qty"]
			}
		}
	},
	"required" : ["name","description","requirement"]
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/*								API REQUEST 								*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/


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
			res.status('503').send({"status" : "error","message" : 'API cant access to the mongo database.'});

		else
			res.send({"status" : "success","message" : 'API is connecting with mongo database.'});
	 });
});

/**
* @desc : Get back the informations about a specific user.
* @param : userid - The user id or his name
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



router.delete('/user/:userid', (req, res,next) => {

});

/**
* @desc : Get all the creatures belonged to a specific user.
* @param : userid - The user id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
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

/* POST -> TODO */
router.post('/user/:userid/creature', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [POST] => Try to summon a creatures for "+ id +".");
	let tmpBdy = req.body;
	//Analyse the body
	if(tmpBdy.name && tmpBdy.description){
		console.log("VALID")
	}
	else {
		console.log("INVALID")
	}

	res.send({"status":"success","userid":id,"creatures":"Miaou !","s_object":tmpBdy});
});

/**
* @desc : Get all the ressources belonged to a specific user.
* @param : userid - The user id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
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


/**
* @desc : Get all the artefacts belonged to a specific user.
* @param : userid - The user id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
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


/**
* @desc : Check all the ressources existing in the system.
* @option : ararity - Filter by rarity
	* @value : Very Common, Uncommon, Rare, Very Rare...
	* @format : ?rarity=optionRarity
* @option : name
	* @value : A string of your choice
	* format : ?name=optionName
*/
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


/**
* @desc : Check all the creatures existing in the system.
* @option : add_name
	* @value : A string of your choice
	* format : ?name=optionName
*/
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


/**
* @desc : Insert a new creature in the system.
* @return : The creature object if it is created.
*/
router.post('/creature', (req, res,next) => {
	console.log("[INFO] - [POST] => Try to add a creature.");
	let tmpBdy = req.body;

	//Analyse the body
	let validation_o = validate(tmpBdy,sh_creatures_artefacts);
	if(validation_o.errors.length > 0)
		res.status("400").send({"status":"KO","msg":"Invalid request format."});
	else
		insertDB(tmpBdy,"creatures",res);
});



/**
* @desc : Get a specific creature.
* @param : creatureid - The creature id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
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


/**
* @desc : Get the owners of a specific creatures.
* @param : artefactid - The artefact id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
router.get('/creature/:creatureid/owners', (req, res,next) => {
	let id = req.params.creatureid
	id = decodeURIComponent(id)
	console.log("[INFO] - [GET] => Try to get back the owners of the creatures : "+id+".");

	//Check if user uses id or name
	let useName = req.query.usename;
	//If name we can request directly
	if(useName=='true')
		getOwners("creatures",id,res);
	//We need get back the name
	else{
		try{
			var o_id = new mongo.ObjectID(id);
			getOwnersByID("creatures",o_id,res);
		}
		catch(error){
			res.status(400).send({"status":"KO","error":"ID isn't in the right format."});
			return;
		}
	}
});


/**
* @desc : Check all the artefacts existing in the system.
* @option : add_name
	* @value : A string of your choice
	* @format : ?name=optionName
*/
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


/**
* @desc : Insert a new artefact in the system.
* @return : The creature object if it is created.
*/
router.post('/artefact', (req, res,next) => {
	console.log("[INFO] - [POST] => Try to add a new artefact.");
	let tmpBdy = req.body;

	//Analyse the body
	let validation_o = validate(tmpBdy,sh_creatures_artefacts);
	if(validation_o.errors.length > 0)
		res.status("400").send({"status":"KO","msg":"Invalid request format."});
	else
		insertDB(tmpBdy,"artefacts",res);
});

/**
* @desc : Get a specific artefact.
* @param : artefactid - The artefact id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
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


/**
* @desc : Get the owners of a specific artefact.
* @param : artefactid - The artefact id or his name.
* @option : usename - Use this option if you use the name object instead of the id.
	* @value : true or false
	* @format : ?usename=true
*/
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
			res.status('503').send({"status" : "error","message" : 'API cant access to the mongo database.'});
		//Success
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection(name_collection);
			collection.find(toFind,exclude).toArray(function(error,documents){
				if(err) throw error;
				else if(documents.length > 0)
					res.send(documents)
				else
					res.status('404').send({"status" : "NOT_FOUND","msg":"There are no element for this request."});
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
				else if(documents.length>0)
					res.send(documents)
				else
					res.status(404).send({"status" : "NOT_FOUND","msg":"There are no element for this request."});
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
						if(documents.length > 0){
							this_name = documents[0].name;
							getOwners(collection_name,this_name,res);
						}
						else
							res.status(404).send({"status" : "NOT_FOUND","msg":"There are no element for this request."});
					}
			});
		}
	});
}



function insertDB(to_insert,collection_name,res){

	client.connect(function(err, client) {
		if (err){
			res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
			throw err; }
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection(collection_name);
			collection.insertOne(to_insert, function(err,rep){
				if(err){
					res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
					throw err;
				}
				console.log("[INFO] - [INSERT] - A new entry has been added in : "+collection_name);
				//Send the insertion
				res.send(rep.ops[0]);
			});
		}
	});
}
