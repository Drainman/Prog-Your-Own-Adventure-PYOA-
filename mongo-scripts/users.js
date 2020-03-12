db.users.save({
	"name" : "Kurai" ,
	"current_energy" : 100,
	"max_energy" : 100,
	"current_artefact" : null,
	"owned_ressources" : [
		{"Paper" : 100},
		{"Metal" : 75},
		{"Bamboo" : 1000},
		{"Large Gem" : 5},
		{"Rock" : 150}
	],
	"owned_creatures" : [
		{"randomID" : "Red Panda"},
		{"randomIDbis" : "Ancient Golem"}
	],
	"owned_artefacts" : [
		"id1","id2","id3"
	],
	"is_admin" : true
});


db.users.save({
	"name" : "Test" ,
	"current_energy" : 50,
	"max_energy" : 50,
	"current_artefact" : null,
	"owned_ressources" : [],
	"owned_creatures" : [],
	"owned_artefacts" : [],
	"is_admin" : false
});
