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
/* AUTH CONSTANT */
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const mySuperSecretSpecialKey = "redPandaEatBamboo"; //Replace here
// > carreful, if you change this key, the two default users will not work properly.
const tokenTimer = 86400; //token for 24 hours

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
* @desc : Register a new user.
*/
router.post('/auth/register',function(req,res){

	var hashedPassword = bcrypt.hashSync(req.body.password,8);
	//var to_insert = {"name" : req.body.name, "password" : hashedPassword};
	var to_insert = userToCreate(req.body.name,hashedPassword);

	client.connect(function(err, client) {
		if (err) return res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection("users");
			collection.insertOne(to_insert, function(err,rep){
				if(err){
					res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
					throw err;
				}
				console.log("[INFO] - [INSERT] - A new user has been added : " + req.body.name);
				var token = jwt.sign({id:rep.ops[0]._id},mySuperSecretSpecialKey,{expiresIn:tokenTimer});
				//Send the insertion
				res.send({auth:true,token:token});
			});
		}
	});
});

/*
* @desc : Get back info about current user.
*/
router.get('/auth/me',verifyToken,function(req,res,next){
	client.connect(function(err, client) {
		if (err) return res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
		//else
		let db = client.db(dataBaseName);
		let collection = db.collection("users");
		let o_id = new mongo.ObjectID(req.userId);
		let toFind = {_id : o_id};

		var exclude = { "projection" : {
			'password':0,
			'owned_creatures' : 0,
			'owned_artefacts' : 0,
			'owned_ressources' : 0
		}};

		collection.findOne(toFind,exclude, function(err,rep){
			if(err) return res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
			if(!rep) return res.status('404').send("No user found.");
			res.send(rep);
		});
	});
});

/**
* @desc : Login in application. Give a token you have to use for some requests.
*/
router.post('/auth/login',function(req,res){

	let toFind = {name:req.body.name};

	client.connect(function(err, client) {
		if (err) return res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
		//else
		let db = client.db(dataBaseName);
		let collection = db.collection("users");

		collection.findOne(toFind, function(err,rep){
			if(err) return res.status("520").send({"status":"KO","msg":"Unknow error with the mongo DB."});
			if(!rep) return res.status('404').send("No user found.");

			var passWordIsValid = bcrypt.compareSync(req.body.password,rep.password);
			if(!passWordIsValid) return res.status(401).send({auth:false,token:null});

			var token = jwt.sign({id:rep._id},mySuperSecretSpecialKey,{expiresIn:tokenTimer});
			res.send({auth:true,token:token});
		});
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
		'password':0,
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
		'password':0,
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
router.post('/user/:userid/creature', verifyToken, async (req, res,next) => {
	let id = req.params.userid;
	let tmpBdy = req.body;

	//Check if the summoner is the user of the targeted account.
	if(req.userId != id) return res.status(403).send({auth:false,"message":"You aren't the user of this account."});

	console.log("[INFO] - [POST] => Try to summon a creatures for "+ id +".");
	//Analyse the body
	if(tmpBdy.creature_id){
		//1. Get the creature informations
		try{var o_id = new mongo.ObjectID(tmpBdy.creature_id);}
		catch(error){return res.status(400).send({"status":"KO","error":"Creature ID isn't in the right format."});}
		var findCreature = {"_id":o_id};
		var creature = await getCreatureRequirements(findCreature);
		if(creature==null) return res.status(404).send({"status":"404","message":"Creature not found."});
		//2. Get the ressource of the summoner
		try{var o_id_u = new mongo.ObjectID(req.userId);}
		catch(error){return res.status(400).send({"status":"KO","error":"User ID isn't in the right format."});}
		var findUser = {"_id":o_id_u};
		var userInfo = await sync_getUserInfo(findUser);
		if(userInfo==null) return res.status(404).send({"status":"404","message":"User not found."});
		// 2b. Check if the user have already this monster
		if(userInfo.owned_creatures.includes(creature.name))
			return res.status(403).send({status:"403 - Forbidden","message" :"User already have this creature."});

		//3. Check if summoner have enough ressources
		let canSummon = true;
		let creatureRequirements = creature.requirement;
		let userRessouces = userInfo.owned_ressources;
		for(var it=0;it<creatureRequirements.length;it++){
			let aRequire = creatureRequirements[it];
			let haveThisRequirement = false;
			for(var itU=0;itU<userRessouces.length;itU++){
				let aRessource = userRessouces[itU];
				if(aRequire.name == aRessource.name &&
					aRequire.units < aRessource.units){
					haveThisRequirement = true;
					let remainRessource = aRessource.units - aRequire.units
					userRessouces[itU] = {name : aRessource.name,units : remainRessource}
					break;
				}
			}
			canSummon = canSummon && haveThisRequirement;
		}
		//	-> YES : Add the creature name in the list of owned_creatures
		if(canSummon){
			console.log("[INFO] ~ User can summon the requested creature : "+ creature.name +".");
			await updateUserCreatures(findUser,creature.name);
			await updateUserRessource(findUser,userRessouces);
			return res.send(await sync_getUserInfo(findUser));
		}
		// 	-> NO  : send-> not enough ressources
		else return res.status(403).send({"status":"403","message":"You don't have the requirements to summon this creature."});

	}

	else return res.status(400).send({"status":"KO","message":"Invalid request format. Please check your body."});
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
		'password':0,
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
		'password':0,
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
		'password':0,
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

	client.connect(function(err, client) {
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


function verifyToken(req,res,next){
	var token = req.headers['x-access-token'];
	if(!token) return res.status(403).send({auth:false,message:"No token provided."});

	jwt.verify(token,mySuperSecretSpecialKey,function(err,decoded){
		if(err) res.status(500).send({auth:false, message:"Failed to authenticate token."});
		req.userId = decoded.id;
		next();
	});
}

function userToCreate(name,pass){

	return {
		"name" : name ,
		"password" : pass,
		"current_energy" : 25,
		"max_energy" : 25,
		"current_artefact" : null,
		"owned_ressources" : [],
		"owned_creatures" : [],
		"owned_artefacts" : [],
		"is_admin" : false
	}
}


async function getCreatureRequirements(o_find){
	let result = null;
	const t = await client.connect();
	let db = await client.db(dataBaseName);
	let collection = await db.collection("creatures");
	const res = await collection.find(o_find).toArray();
	if(res.length>0) result = res[0];
	return result;
}

async function sync_getUserInfo(o_find){

	var exclude = { "projection" :{
		'password':0,
		'current_artefact' :0,
		'owned_artefacts' :0,
		'is_admin' :0
	}};


	let result = null;
	const t = await client.connect();
	let db = await client.db(dataBaseName);
	let collection = await db.collection("users");
	const res = await collection.find(o_find,exclude).toArray();
	if(res.length>0) result = res[0];
	return result;
}

async function updateUserCreatures(userID,creature_name){
	let toUpdate = { $push: { owned_creatures: creature_name } };
	let result = null;
	const t = await client.connect();
	let db = await client.db(dataBaseName);
	let collection = await db.collection("users");

	const res = await collection.update(userID,toUpdate);
}

async function updateUserRessource(userID,ressourceUpdate){
	let toUpdate = { $set : { owned_ressources : ressourceUpdate }};
	let result = null;
	const t = await client.connect();
	let db = await client.db(dataBaseName);
	let collection = await db.collection("users");

	const res = await collection.update(userID,toUpdate);
}
