var linksammlung = [
	{
		name: "golem",
		url: "https://golem.de/ticker/",
		top: 120,
		httpWorkaround: true
	},
	{
		name: "t3n",
		url: "https://www.t3n.de/news/",
		top: 90
	},
	{
		name: "heise",
		url: "https://www.heise.de/newsticker/",
		top: 70
	},
	{
		name: "faz",
		url: "https://www.faz.net/aktuell/",
		top: 246,
		small: true	
	},
	{
		name: "zeit",
		url: "https://www.zeit.de/",
		top: 240,
		small: true
	},
	{
		name: "sz",
		url: "https://www.sueddeutsche.de",
		top: 215,
		small: true
	},
	{
		name: "welt",
		url: "https://www.welt.de",
		top: 220,
		small: true
	},
	{
		name: "reddit",
		url: "https://www.reddit.com/",
		top: 55
	},
	{
		name: "whatsapp",
		url: "https://web.whatsapp.com",
		top: 120,
		small: true
	},
	{
		name: "degiro",
		url: "https://trader.degiro.nl/trader/#!/portfolio",
		top: 162,
		small: true
	},
	{
		name: "notes",
		url: "https://wordpad.cc/vaPrZ7fV",
		top: 52
	}
];

var randomTitles = [
	"Account Unlinking on Actions on Google",
	"Request Sync always returns 404 : “Error: Entity was found”",
	"Error submitting assistant app started appearing for AoG",
	"Is it possible to access the argument of an arrow function ...",
	"Can not serialize my class to the desired json file",
	"Not getting webhook request after enabling account linking ...",
	"Node callback returns mysql result but i cant print to the ...",
	"Error 'NOT_FOUND' using Actions on Google library for Java ...",
	"Cannot bring data from Firestore in Dialogflow Fulfillment ...",
	"MalformedResponse Error on Google Assistant",
	"Suddenly conv.user.storage data is not persisting or acting ..."
];

//damit neues Objekt und keine Referenz
var lastSelection = JSON.parse(JSON.stringify(linksammlung[0]));

function setRandomTitle() {
	var randomTitle = randomTitles[Math.floor(Math.random()*randomTitles.length)];
	document.title = randomTitle;
	$("#websitetitle").text(randomTitle);
}

function httpWorkaround (myUrl) {
	return "https://www.google.com/search?q=%" + encodeURI(myUrl) + "&btnI=Im+Feeling+Lucky";
}

//neue Source einstellen und Seitenanfang abschneiden
function setNewSrc(linkObj) {
	setRandomTitle();
	
	if (/^\/r\/\w*\/?$/.test(linkObj.url)) {
		linkObj.url = "https://www.reddit.com" + linkObj.url;
		console.log(linkObj.url);
		linkObj.top = 55;
	} else if (/^\/u\/\w*\/?$/.test(linkObj.url)) {
		linkObj.url.match(/^\/u\/(\w*)\/?$/);
		linkObj.url = "https://www.reddit.com/user/" + RegExp.$1;
		console.log(linkObj.url);
		linkObj.top = 55;
	} else if (/^\/yt\/((\w|\s)*)\/?$/.test(linkObj.url)) {
		linkObj.url.match(/^\/yt\/((\w|\s)*)\/?$/);
		linkObj.url = "https://www.youtube.com/results?search_query=" + RegExp.$1;
		console.log(linkObj.url);
		linkObj.top = 0;
	} else if (!/^https?:\/\/.*$/.test(linkObj.url)) {
		linkObj.url = "https://" + linkObj.url;
	}
	

	
	if (/^(.*);$/.test(linkObj.url)) {
		linkObj.url.match(/^(.*);$/);
		linkObj.url = RegExp.$1;
		linkObj.httpWorkaround = true;
	}
	
	if (linkObj.small) {
		optionToggle("smallVer", linkObj.small);
	} else {
		$("#secretiframe").removeClass("smallVer");
		$("#smallVer").removeClass("youarehere");
	}
	
	//Problem von HTTP- Seiten in HTTPS-Seite umgehen mittels Google-Proxy
	if (linkObj.httpWorkaround) {
		linkObj.url = httpWorkaround(linkObj.url);
	}
	
	$("#secretiframe").attr("src", linkObj.url);
	$("#secretiframe").removeClass("hide");
	$("#hide").removeClass("youarehere");
	
	if (linkObj.top) {
		$("#secretTopHider").css("height", linkObj.top + 20 + "px");
		$("#secretReader").css("top", 100 - linkObj.top + "px");
	} else {
		$("#secretTopHider").css("height", "20px");
		$("#secretReader").css("top", "100px");
	}
	return;
}

function setTopHider(top) {
    $("#secretReader").css("top", 100 - top + "px");
    $("#secretTopHider").css("height", top + "px");
    lastSelection.top = top;
}

//Beim Seitenstart bereits ersten Eintrag vorladen
$( document ).ready(function() {
	for (var i = 0; i < linksammlung.length; i++) {
		$("#shortcuts").append("<a href='#' class='post-tag shortcut'>"+linksammlung[i].name+"</a>");
	}
	setNewSrc(lastSelection);
	
	var urlPassword = new RegExp('[\?&]pw=([^&#]*)').exec(window.location.href);
	if (urlPassword && urlPassword[1] == "57251634") {
		$("body").css("display", "flex");
	}
});



//Beim Klick auf Kategorie die richtige Seite laden
//Event auf *, weil dynamisch erzeugte Elemente beim Clickevent Probleme machen
$(document).click(function(ev) {
	if($(ev.target).hasClass("shortcut")) {
		for (var i = 0; i < linksammlung.length; i++) {
			if($(ev.target).text() == linksammlung[i].name) {
				$("#secretiframe").removeClass("hide");
				$("#hide").removeClass("youarehere");
				setNewSrc(linksammlung[i]);
				lastSelection = JSON.parse(JSON.stringify(linksammlung[i]));
				return;
			}
		}
	} else if ($(ev.target).hasClass("redditshortcut")) {
		lastSelection.name = "redditshortcut";
		lastSelection.url = $(ev.target).text();
		setNewSrc(lastSelection);
	} else if ($(ev.target).hasClass("coderedditShortcut")) {
		if ($(ev.target).text() == "HIDE") {
			$("#coderedditContainer").hide();
			$("#coderedditHider").text("SHOW");
		} else {
			if ($(ev.target).text() != "SHOW") {
				var myUrl = "https://cheapjoe.github.io/stackoverflow/codereddit/?sub=" + $(ev.target).text();
				$("#coderedditIframe").attr("src", myUrl);
			}
			$("#coderedditContainer").show();
			$("#coderedditHider").text("HIDE");
		}
	} else if ($(ev.target).attr("id") == "notes" || $(ev.target).hasClass("notesHeader")) {
		if ($("#notes").hasClass("openedNote")) {
			$("#notes").removeClass("openedNote");
		} else {
			$("#notes").addClass("openedNote");
		}
	} 
});

//Keyevents
var timestamp = Date.now();
$(document).keydown(function(e) {
	
	switch(e.keyCode) {
	  case 192:
	  	//zweimal ^^, um auf Homeseite zurück zu kommen
	    if (Date.now() - timestamp <= 350) {
			setNewSrc(lastSelection);
	    } else {
		    timestamp = Date.now();
	    }
	    break;
	  case 187:
	  	// "+" --> erhöhe die Sichtbarkeit
	  	var opacityVal = parseFloat($("#secretiframe").css("opacity"));
	  	if (opacityVal * 1.3 < 1) {
		  	$("#secretiframe").css("opacity", opacityVal * 1.3);
	  	} else {
		  	$("#secretiframe").css("opacity", 1);
	  	}
	    break;
	  case 189:
	  	// "-" --> reduziere die Sichtbarkeit
	  	var opacityVal = $("#secretiframe").css("opacity");
		$("#secretiframe").css("opacity", opacityVal * 0.7);

	    break;
	  case 220:
	  	// "#" --> hide / show
	  	if ($("#secretiframe").is(':visible')) {
		  	$("#secretiframe").addClass("hide");
		  	$("#hide").addClass("youarehere");
		  	
	  	} else {
		  	$("#secretiframe").removeClass("hide");
		  	$("#hide").removeClass("youarehere");
	  	}
	    break;
	  case 49:
	  	// "1" --> emergency exit
	  	window.open('https://stackoverflow.com/questions/57251634/typeerror-write-argument-must-be-str-not-list-while-writing-to-file', '_blank');
	    break;
	  case 8:
	  	// Löschen/Zurück --> zurück auf die Startseite
	  	setNewSrc(lastSelection);
	    break;
	  case 50:
		// "2" --> um random scrollen
		window.scrollTo(0,450);
		setRandomTitle();
		setTimeout(function(){
			window.scrollTo(0,600);
			setTimeout(function(){
				window.scrollTo(0,0);
			}, 180);
		}, 200);
	  default:
	    //console.log("key pressed: " + e.keyCode);
	}
});

//Wenn Form Submit, dann eigene URL reinladen
$(document).submit(function(e) {
	if ($(e.target).attr('id') == "ownUrlForm") {
		if (/^\/(cr)\/(\w*)\/?$/.test($("#ownUrlInput").val())) {
			$("#coderedditContainer").show();
			$("#coderedditHider").text("HIDE");
			$("#ownUrlInput").val().match(/^\/(cr)\/(\w*)\/?$/);
			var myUrl = "https://cheapjoe.github.io/stackoverflow/codereddit/?sub=" + RegExp.$2;
			$("#coderedditIframe").attr("src", myUrl);
		} else {
			
			var linkObj = {
				name: "custom",
				top: 0
			};
			linkObj.url = $("#ownUrlInput").val();
			
			lastSelection = linkObj;
			
			setNewSrc(lastSelection);
		}
	    e.preventDefault();
	}
});


var isDragging = false;
var mouseValY;
var initialHeight;
var newHeight;
$(document).mousedown(function(ev) {
	if ($(ev.target).attr("id") == "secretTopHider") {
	    isDragging = true;
	    mouseValY = ev.pageY;
	    initialHeight = parseInt($("#secretTopHider").css("height"));
	}
});
$(document).mousemove(function(ev) {
	if (isDragging) {
		newHeight = initialHeight + (ev.pageY - mouseValY);
		
		if (newHeight < 20) {
			newHeight = 20;
		}
		
		$("#secretTopHider").css("height", newHeight + "px");
	}
});
$(document).mouseup(function(ev) {
	console.log("new topVal: " + newHeight);
    if (isDragging) {
		setTopHider(newHeight);
    }
    isDragging = false;
});


function optionToggle(className, forceActivation) {
	if (!$("#secretiframe").hasClass(className) || forceActivation) {
		$("#secretiframe").addClass(className);
		$("#" + className).addClass("youarehere");
	} else {
		$("#secretiframe").removeClass(className);
		$("#" + className).removeClass("youarehere");
	}
}
