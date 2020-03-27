/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/
/*							FILE : schema.js								*/
/*				Contains all the JSON schema use by the app.				*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -*/

module.exports = {

	sh_creatures_artefacts : {
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
						"units" : {"type" : "integer"}
					},
					"required" : ["name","units"]
				}
			}
		},
		"required" : ["name","description","requirement"]
	},

	sh_ressource : {
		"type" : "object",
		"properties": {
			"name": {"type": "string"},
			"description" :{"type": "string"},
			"rarity" : {"type" : "string"},
			"ratioTU" : {"type" : "number"}
		},
		"required" : ["name","description","rarity","ratioTU"]
	}
}
