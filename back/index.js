const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;
const mongoURL = "mongodb://localhost:27017/";
const client = MongoClient(mongoURL,{ useUnifiedTopology: true });
const dataBaseName = "pyoa";

/* TEST API OK */
router.get('/', (req, res) => {
  res.send({
	  "status" : "success",
	  "message" : 'API is operational. Have a good game backpacker.'
  	});
});

/* TEST MONGO DB */
router.get('/db_status',(req,res) => {

	client.connect(function(err) {
		if (err)
			res.send({"status" : "error","message" : 'API cant access to the mongo database.'});

		else{
			res.send({"status" : "success","message" : 'API is connecting with mongo database.'});
			client.close();
		}

	 });
});

router.get('/user/:userid', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the informatiosn about "+ id +".");
	res.send({"status":"success","userid":id});
});

router.get('/user/:userid/creature', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the creatures of "+ id +".");
	res.send({"status":"success","userid":id,"creatures":"Miaou !"});
});

router.post('/user/:userid/creature', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [POST] => Try to summon a creatures for "+ id +".");
	let tmpBdy = req.body;
	res.send({"status":"success","userid":id,"creatures":"Miaou !","s_object":tmpBdy});
});

router.get('/user/:userid/ressource', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the ressources of "+ id +".");
	res.send({"status":"success","userid":id,"ressources":"Gold... everywhere !"});
});


router.get('/user/:userid/artefact', (req, res,next) => {
	let id = req.params.userid;
	console.log("[INFO] - [GET] => Try to acces to the artefacts of "+ id +".");
	res.send({"status":"success","userid":id,"ressources":"Oh a diamond ! Oh.. just a shitty plastic things."});
});


router.get('/ressource', (req, res,next) => {
	console.log("[INFO] - [GET] => Try to get back the ressources from the system.");
	res.send({"status":"success","ressources":"Dust and smoke... nothing more."});
});


router.get('/creature', (req, res,next) => {
	console.log("[INFO] - [GET] => Try to get back the creature from the system.");
	res.send({"status":"success","creature":"Some miaou and wouf wouf."});
});


router.get('/creature/:creatureid', (req, res,next) => {
	let id = req.params.creatureid
	console.log("[INFO] - [GET] => Try to get back the creature : "+id+".");
	let str_compose = "Just a " + id + ".";
	res.send({"status":"success","creature":str_compose});
});

router.get('/artefact', (req, res,next) => {
	console.log("[INFO] - [GET] => Try to get back the artefacts from the system.");
	//Connection to mongodb
	client.connect(function(err, client) {
		//Fail
		if (err)
			res.send({"status" : "error","message" : 'API cant access to the mongo database.'});
		//Success
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection("artefacts");
			collection.find({}).toArray(function(error,documents){
				if(err) throw error;
				res.send(documents)
			});
		}
	 });
});


router.get('/artefact/:artefactid', (req, res,next) => {
	let id = req.params.artefactid
	console.log("[INFO] - [GET] => Try to get back the artefact : "+id+".");

	// TODO : Use ObjectID
	//Check if id can be an ObjectID or a label
	let regex_num = /[0-9]/gm;
	let found = id.match(regex_num);
	if(found){
		var o_id = new mongo.ObjectID(id);
		var toFind = {"_id":o_id}
	}
	else
		var toFind = {"name":id}

	client.connect(function(err, client) {
		//Fail
		if (err)
			res.send({"status" : "error","message" : 'API cant access to the mongo database.'});
		//Success
		else{
			let db = client.db(dataBaseName);
			let collection = db.collection("artefacts");
			collection.find(toFind).toArray(function(error,documents){
				if(err) throw error;
				res.send(documents)
			});
		}
	 });
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
