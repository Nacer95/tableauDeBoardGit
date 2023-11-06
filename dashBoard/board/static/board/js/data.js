			var htmlOutput;
			var allData = new Array();
			var sessionData = new Array();

			// Process LRS results
			function processLrsResult(err, response, myTinCanLRS) {
				if (err !== null) {
					htmlOutput.innerHTML = "Failed to query statements: " + err; return;
				}
				//htmlOutput.innerHTML += "Statements received: "+response.statements.length+"<br>";
				if (response.statements.length > 0){
					// enregistrement du statement
					for (let j = 0; j < response.statements.length; j++ )
						sessionData.push(response.statements[j])

					// Vérifier si l’on doit récupérer plus de données
					if (response.more !== null && response.more !== "") {
						//htmlOutput.innerHTML += "Require to fetch more data<br>";
						myTinCanLRS.moreStatements({
							url: response.more,
							callback: function (err, response){
							processLrsResult(err, response, myTinCanLRS); }
						});
					}

					else {
						// trier les statement du plus ancien au plus récent
						sessionData.sort(function(from, to){
							date1 = new Date(from.timestamp); date2 = new Date(to.timestamp);
							return date1 - date2;
						});
						// Affichage des statements triés
						for (let j = 0; j < sessionData.length; j++ ){
							//htmlOutput.innerHTML += sessionData[j]+ " "+sessionData[j].timestamp+"<br>"; // Affichage du statement dans la console
							//console.log(sessionData[j]);
						}

						//*******************************************
						// Gestion des données
						// sessionData
						//********************************************
						console.log(sessionData.length)











					}
				}
			}

			function query(myTinCan){
				myTinCan.lrs.queryStatements(
					{
					    params: {
					    	agent: new TinCan.Agent({
							account: {
							"homePage": "https://www.lip6.fr/mocah/", "name": "93655853" }
							             }),
							      limit: 100
						},
						verb: new TinCan.Verb({
							id: "http://adlnet.gov/expapi/verbs/launched"
						}),
						callback: function (err, response) {
							processLrsResult(err, response, myTinCan.lrs);
							if (err !== null) {
								console.log("Failed to query statements: " + err); return;
							}
							//htmlOutput.innerHTML += "Nombre de statements reçus : " + response.statements.length + "<br>";
							}
					});
				//console.log(sessionData.length);
			}


			window.onload = function(){
				// récupération de la balise result
				htmlOutput = document.getElementById("result");
				var myTinCan;
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
					htmlOutput.innerHTML += "Envoi requête, en attente de réponse...<br>";
					query(myTinCan);
					//console.log(sessionData)


				}
				catch (ex) {
					htmlOutput.innerHTML = "Failed to setup LRS object: "+ ex;
				}
			};
