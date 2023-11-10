var htmlOutput;
var allData = new Array();
var sessionData = new Array();
var myTinCan;
var idStudent = "93655853"
// sessionDatas
var sessionDataProgressionBar = [];
var sessionDataAll = [];
var sessionFragmentedByLevel = [[]];



//Main
function searchStudent() {
	console.log("searchStudent");
    // Récupérer l'identifiant de l'étudiant depuis le champ d'entrée
    var studentId = document.getElementById("studentIdInput").value;
    // Vérifier si l'identifiant n'est pas vide avant de lancer la requête
    if (studentId.trim() !== "") {
        // Réinitialiser les données précédentes si nécessaire
        sessionData = [];
        // Appeler la fonction query avec l'identifiant de l'étudiant
        //query(myTinCan, "completed", studentId);
		//console.log("identifiant"+studentId)

		/**********************
		 *
		 * function to launch
		 *
		 **********************/
		progressionBar();
		dataByLevel();


    } else {
        // Gérer le cas où l'identifiant est vide
        alert("Identifiant d'étudiant non valide. Veuillez entrer un identifiant valide.");
    }
}


//Launch functions
function progressionBar(){
	console.log("progressionBar")
	query(myTinCan, "completed", [displayProgressionBar], sessionDataProgressionBar,  idStudent)
}
function dataByLevel(){
	console.log("dataByLevel")
	query(myTinCan, "all", [filterDataByLevel, getLevelreactionTime], sessionDataAll,  idStudent)

}



//Display functions
function displayProgressionBar(){
	sessionData = sessionDataProgressionBar
	console.log("displayProgressionBar")
	let maxValue = 50
	let currentValue = sessionData.length
	let percentage = (currentValue / maxValue) * 100;
	let progressionHTML;
	progressionHTML = document.getElementById("barreDeProgression");
	//progressionHTML.innerHTML += "salut";
	progressionHTML.style.width = "100%" ;
	progressionHTML.style.height = "20px";
	progressionHTML.style.backgroundColor = "#ffffff";
	progressionHTML.style.marginTop = "10px";

    var progressBar = document.createElement("div");
    progressBar.style.width = percentage + "%";
    progressBar.style.height = "20px"; // Ajuster la hauteur selon tes besoins
    progressBar.style.backgroundColor = "#4CAF50"; // Couleur verte (ajuster selon tes besoins)
    progressBar.style.marginTop = "10px"; // Ajuster la marge selon tes besoins

	var progressBarTxt = document.createElement("div");
	progressBarTxt.innerHTML += currentValue+"/"+maxValue;
	progressBarTxt.style.marginTop = "7px";

	progressionHTML.appendChild(progressBar);
	progressionHTML.appendChild(progressBarTxt);

	sessionDataProgressionBar = [];

}
function filterDataByLevel() {
	console.log("filterDataByLevel");
    let store = false;
    let dataLevel = [];
    for (let j = 0; j < sessionDataAll.length; j++) {
        if (sessionDataAll[j].verb.id == "http://adlnet.gov/expapi/verbs/launched") {
            dataLevel = [];
            store = true;
        }
        if (store) {
            dataLevel.push(sessionDataAll[j]);
        }
        if (
            sessionDataAll[j].verb.id === "http://adlnet.gov/expapi/verbs/completed" ||
            sessionDataAll[j].verb.id === "http://adlnet.gov/expapi/verbs/exited"
        ) {
            if (store) {
                sessionFragmentedByLevel.push(dataLevel);
                store = false;
            }
        }
    }
    // Si store est toujours vrai à la fin, il faut ajouter les données restantes.
    if (store) {
        sessionFragmentedByLevel.push(dataLevel);
   	}
    //console.log(sessionDataAll);
    console.log(sessionFragmentedByLevel);
}
function getLevelreactionTime(){

	let reactionTimePerLevel = [];
	let launchTime;
	let firstInsertionTime=null;
	if(sessionFragmentedByLevel !== [[]]){
		for(let j = 1; j<sessionFragmentedByLevel.length; j++){
			if (sessionFragmentedByLevel[j] !== []) {
				//console.log(sessionFragmentedByLevel[j]);}
				let sessionDataLevel = [];
				sessionDataLevel = sessionFragmentedByLevel[j];
				//console.log(sessionDataLevel[0].timestamp);
				launchTime = sessionDataLevel[0].timestamp;
				for (let i = 0; i < sessionDataLevel.length; i++) {
					//console.log(sessionDataLevel[i].verb.id);
					if (
						sessionDataLevel[i].verb.id === "https://spy.lip6.fr/xapi/verbs/opened" ||
						sessionDataLevel[i].verb.id === "https://spy.lip6.fr/xapi/verbs/inserted"
					) {
						firstInsertionTime = sessionDataLevel[i].timestamp;
						//console.log(firstInsertionTime);
						break;
					}
				}
				// Cas ou le niveau n'est pas fini
				if (firstInsertionTime === null) {
					console.log("null");
					reactionTimePerLevel.push(null);
				} else {
					console.log("find");
					let reactionTimeValue;
					console.log(firstInsertionTime);
					console.log(launchTime);
					const date1 = new Date(firstInsertionTime);
					const date2 = new Date(launchTime);
					const differenceInMillis = date1 - date2;
					const differenceInSeconds = differenceInMillis / 1000;
					//reactionTimeValue = firstInsertionTime - launchTime;

					reactionTimePerLevel.push(differenceInSeconds);
				}
			}
		}
	}
	console.log(reactionTimePerLevel);
}


// Process LRS results
function processLrsResult(err, response, myTinCanLRS, functionsToCall, dataStorage) {
	console.log("processLrsResult")
	if (err !== null) {
		htmlOutput.innerHTML = "Failed to query statements: " + err; return;
	}
	//htmlOutput.innerHTML += "Statements received: "+response.statements.length+"<br>";
	if (response.statements.length > 0){
		// enregistrement du statement
		for (let j = 0; j < response.statements.length; j++ )
			dataStorage.push(response.statements[j])

		// Vérifier si l’on doit récupérer plus de données
		if (response.more !== null && response.more !== "") {
			//htmlOutput.innerHTML += "Require to fetch more data<br>";
			myTinCanLRS.moreStatements({
				url: response.more,
				callback: function (err, response){
				processLrsResult(err, response, myTinCanLRS, functionsToCall, dataStorage); }
			});
		}
		else {
			// trier les statement du plus ancien au plus récent
			dataStorage.sort(function(from, to){
				date1 = new Date(from.timestamp);
				date2 = new Date(to.timestamp);
				return date1 - date2;
			});
			// Affichage des statements triés
			for (let j = 0; j < dataStorage.length; j++ ){
				//htmlOutput.innerHTML += sessionData[j]+ " "+sessionData[j].timestamp+"<br>"; // Affichage du statement dans la console
				//console.log(sessionData[j]);
			}
			//*******************************************
			// Gestion des données
			// sessionData
			//********************************************
			//functionsToCall()
			if (functionsToCall) {
				for (let k = 0; k < functionsToCall.length; k++) {
					if (typeof functionsToCall[k] == 'function') {
						console.log('function')
						functionsToCall[k]();
						//levelReactionTime();
					} else {
						console.log("La valeur passée en paramètre n'est pas une fonction.");
					}
				}
			}
			//levelReactionTime();
			//console.log(dataStorage)
		}
	}else {
		alert("Identifiant d'étudiant non valide. Veuillez entrer un identifiant valide.");
	}
}
function query1(myTinCan, verbe, functionToCall=null, dataStorage = [], idStudentQuery = idStudent ){
	console.log("query")
	myTinCan.lrs.queryStatements(
		{
			params: {
				agent: new TinCan.Agent({
					account: {
					"homePage": "https://www.lip6.fr/mocah/", "name": idStudentQuery }
				}),

				verb: new TinCan.Verb({
					id: "http://adlnet.gov/expapi/verbs/"+verbe
				}),
				limit: 100
			},
			callback: function (err, response) {
				processLrsResult(err, response, myTinCan.lrs, functionToCall, dataStorage);
				if (err !== null) {
					console.log("Failed to query statements: " + err); return;
				}
				//htmlOutput.innerHTML += "Nombre de statements reçus : " + response.statements.length + "<br>";
			}
		});
	//console.log(sessionData.length);
}
function query(myTinCan, verbe, functionsToCall = null, dataStorage = [], idStudentQuery = idStudent) {
    console.log("query");

    var params = {
        agent: new TinCan.Agent({
            account: {
                "homePage": "https://www.lip6.fr/mocah/",
                "name": idStudentQuery
            }
        }),
        limit: 100
    };

    if (verbe !== "all") {
        params.verb = new TinCan.Verb({
            id: "http://adlnet.gov/expapi/verbs/" + verbe
        });
    }

    myTinCan.lrs.queryStatements({
        params: params,
        callback: function (err, response) {
            processLrsResult(err, response, myTinCan.lrs, functionsToCall, dataStorage);
            if (err !== null) {
                console.log("Failed to query statements: " + err);
                return;
            }
            //htmlOutput.innerHTML += "Nombre de statements reçus : " + response.statements.length + "<br>";
        }
    });
    //console.log(sessionData.length);
}


window.onload = function(){
	// récupération de la balise result
	htmlOutput = document.getElementById("result");

	try{
	  myTinCan = new TinCan();
	  myTinCan.lrs = new TinCan.LRS(
	  {
		endpoint: "https://lrsels.lip6.fr/data/xAPI",
		username: "9fe9fa9a494f2b34b3cf355dcf20219d7be35b14",
		password: "b547a66817be9c2dbad2a5f583e704397c9db809"
		});
		htmlOutput.innerHTML = "Connection avec le LRS OK<br>";

		// Construction d'une requête pour récupérer tous les statements d'un agent
		//htmlOutput.innerHTML += "Envoi requête, en attente de réponse...<br>";
		query(myTinCan, "completed");
		//console.log(sessionData)
	}
	catch (ex) {
		htmlOutput.innerHTML = "Failed to setup LRS object: "+ ex;
	}
};
