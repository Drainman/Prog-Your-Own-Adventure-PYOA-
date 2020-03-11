const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const mongo = require("mongodb").MongoClient;
const mongoURL = "mongodb://localhost:27017/";


/* TEST API OK */
router.get('/', (req, res) => {

  res.send({
	  "status" : "success",
	  "message" : 'API is operational. Have a good game backpacker.'
  	});

});

/* TEST MONGO DB */
router.get('/db_status',(req,res) => {

	mongo.connect(mongoURL, function(err, db) {
		if (err){
			res.send({"status" : "error","message" : 'API cant access to the mongo database.'});
			throw err;
		}

		else{
			res.send({"status" : "success","message" : 'API is connecting with mongo database.'});
			db.close();
		}

	 });
});

router.get('/db_status',(req,res) => {

	mongo.connect(mongoURL, function(err, db) {
		if (err) throw err;

		else{
			res.send({"status" : "success","message" : 'API is connecting with mongo database.'});
			db.close();
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
