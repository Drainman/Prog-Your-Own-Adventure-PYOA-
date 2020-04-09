db.users.save({
	"name" : "Kurai" ,
	"password" : "$2a$08$GON44RMeBX1M8sWkzMm1Ueqq1C1X4S876v9cNof3pFb7rxhrkOTQi",
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
	"password" : "$2a$08$TyTt9OqBK6CvQQ/A85moKuiL7XXfe9h2FeqZ32Ez2xu2mysVzI.pW",
	"current_energy" : 100,
	"max_energy" : 100,
	"current_artefact" : null,
	"owned_ressources" : [
		{"name" : "Paper","units" : 100},
		{"name" : "Bamboo","units" : 20000},
		{"name" : "Metal","units" : 150},
		{"name" : "Large Gem", "units" : 20},
		{"name" : "Mud", "units" : 300},
		{"name" : "Rock","units" : 120}
	],
	"owned_creatures" : [
		"Red Panda","Ancient Golem"
	],
	"owned_artefacts" : [
		"Paper Crown","Mana Geod"
	],
	"is_admin" : false
});
