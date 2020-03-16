db.users.save({
	"name" : "Kurai" ,
	"current_energy" : 100,
	"max_energy" : 100,
	"current_artefact" : null,
	"owned_ressources" : [
		{"name" : "Paper","units" : 100},
		{"name" : "Metal","units" : 75},
		{"name" : "Bamboo","units" : 1000},
		{"name" : "Large Gem","units" : 5},
		{"name" : "Rock","units" : 120}
	],
	"owned_creatures" : [
		"Red Panda","Iron Brigadier","Ancient Golem"
	],
	"owned_artefacts" : [
		"Paper Crown","Mana Geod"
	],
	"is_admin" : true
});


db.users.save({
	"name" : "Red Panda" ,
	"current_energy" : 100,
	"max_energy" : 100,
	"current_artefact" : null,
	"owned_ressources" : [
		{"name" : "Paper","units" : 100},
		{"name" : "Bamboo","units" : 20000}
	],
	"owned_creatures" : [
		"Red Panda","Iron Brigadier","Ancient Golem"
	],
	"owned_artefacts" : [
		"Paper Crown","Mana Geod"
	],
	"is_admin" : false
});
