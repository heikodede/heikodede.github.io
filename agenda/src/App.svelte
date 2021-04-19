<script>
	let dataInitialized = false;
	let dataReady = false;
	let currentInfo = {
		secondsAfterStart: undefined,
		meetingEnded: false,
		title: undefined,
		remainingTime: [0,0,0],
		nextTitle: undefined,
		endTime: undefined
	}
	let userInput;
	let eventDate;

	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
		function(m,key,value) {
		if (value == "true") {
			value = true;
		}
		if (value == "false") {
			value = false;
		}
		
		vars[key] = value;
		});
		return vars;
	}

	(async function initializeData() {
		//e.g. ?blobId=70f730f3-a147-11eb-97b4-193adf2ba741
		let blobId = getUrlVars()["blobId"];
		const response = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`);
		if (response.ok) {
			userInput = await response.json();
			console.log(userInput);
		} else {
			console.log("local fallback used, because blobId is invalid")
			userInput = {
				"date": 20,
				"month": 4,
				"year": 2021,
				"startTime": "09:00",
				"delayInMin": 0,
				"agenda": [{
					"durationInMin": 60,
					"title": "Kennenlernen QA / MW"
				},{
					"durationInMin": 30,
					"title": "Aktueller Stand von Ceres - Pt. I"
				},{
					"durationInMin": 15,
					"title": "Kaffeepause"
				},{
					"durationInMin": 60,
					"title": "Aktueller Stand von Ceres - Pt. II"
				},{
					"durationInMin": 60,
					"title": "Auftrag an Ceres"
				},{
					"durationInMin": 45,
					"title": "Mittagspause"
				},{
					"durationInMin": 60,
					"title": "Zusammenarbeit von QA & MW"
				},{
					"durationInMin": 10,
					"title": "Kaffeepause"
				},{
					"durationInMin": 30,
					"title": "Ausblick: Timeline von Ceres"
				},{
					"durationInMin": 20,
					"title": "Blitzlicht-Runde"
				}]
			};
		}

		if ( getUrlVars()["test"] ) {
			userInput.date = 19;
			userInput.month = 4;
			userInput.startTime = "22:00";
			userInput.agenda = [{
				durationInMin: 90,
				title: "testA"
			},{
				durationInMin: 45,
				title: "testB"
			}];
		}

		eventDate = new Date();
		eventDate.setFullYear(userInput.year);
		eventDate.setMonth(userInput.month - 1); //0 = Jan, 1 = Feb, ...
		eventDate.setDate(userInput.date);
		eventDate.setHours(userInput.startTime.split(":")[0]);
		eventDate.setMinutes(userInput.startTime.split(":")[1]);
		eventDate.setMinutes(eventDate.getMinutes() + userInput.delayInMin);
		eventDate.setSeconds(0, 0);

		dataInitialized = true;
	})();
	
	const zeroPad = (num, places) => String(num).padStart(places, '0')
	function getSecondsBetweenDates(firstDate, secondDate) {
		return Math.round((secondDate - firstDate) / 1000);
	}
	function formatSecondsToHMS(durationInSeconds) {
		let hours = Math.floor( durationInSeconds / (60*60));
		let minutes = Math.floor( (durationInSeconds / 60) - (hours * 60) );
		let seconds = Math.round( durationInSeconds - ( (minutes * 60) + (hours * 60 * 60)) );
		return [hours,minutes,seconds];
	}
	function beautifyHMS(hmsArray) {
		let HmsString = "";
		if (hmsArray[0] != 0) {
			HmsString += zeroPad(hmsArray[0],2); //hours
			HmsString += "h ";
		}
		HmsString += zeroPad(hmsArray[1],2); //minutes
		HmsString += "m ";
		HmsString += zeroPad(hmsArray[2],2); //seconds
		HmsString += "s";
		return HmsString;
	}
	function findCurrentAgendaItem(secondsAfterStart, agenda) {
		let secCounter = 0;
		let returnObj = {
			item: undefined,
			secondsInAgendaItem: 0,
			nextItem: undefined,
			totalAgendaTimeInSec: undefined
		};
		agenda.forEach( (item, index) => {
			secCounter += item.durationInMin * 60;
			if (typeof returnObj.item == "undefined") {
				if (secCounter > secondsAfterStart) {
					returnObj.item = item;
					let secondsBeforeCurrentItem = secCounter - item.durationInMin * 60;
					returnObj.secondsInAgendaItem = secondsAfterStart - secondsBeforeCurrentItem;
					if (typeof agenda[index + 1] != "undefined") {
						returnObj.nextItem = agenda[index + 1];
					}
				}
			}
		});
		returnObj.totalAgendaTimeInSec = secCounter;
		return returnObj;
	}
	
	setInterval(function(){ 
		if (dataInitialized) {
			let now = new Date();
			currentInfo.secondsAfterStart = getSecondsBetweenDates(eventDate, now);
			
			if (currentInfo.secondsAfterStart >= 0) {
				let currentAgenda = findCurrentAgendaItem(currentInfo.secondsAfterStart, userInput.agenda);
				if (typeof currentAgenda.item == "undefined") {
					currentInfo.meetingEnded = true;
				} else {
					currentInfo.title = currentAgenda.item.title;
					currentInfo.remainingTime = (currentAgenda.item.durationInMin * 60) - currentAgenda.secondsInAgendaItem;
					
					if (currentAgenda.nextItem) {
						currentInfo.nextTitle = currentAgenda.nextItem.title;
					} else {
						currentInfo.nextTitle = undefined;
					}
					
					let endDate = new Date(eventDate.getTime() + ( (currentAgenda.totalAgendaTimeInSec) * 1000 ));
					currentInfo.endTime = `${endDate.getHours()}:${endDate.getMinutes()}`;
				}
			}
			dataReady = true;
		}
	}, 1000);

</script>

<div class="container">
	{#if dataReady}
		{#if currentInfo.secondsAfterStart < 0 }
			<div class="textContainer">
				<div class="title">Meeting will beginn in</div>
				<div class="text">{beautifyHMS( formatSecondsToHMS(-1 * currentInfo.secondsAfterStart) )} at {userInput.startTime}</div>		
			</div>
			{#if userInput.delayInMin > 0}
				<div class="textContainer small">
					<div class="title">Expected Delay</div>
					<div class="text">{userInput.delayInMin} minutes</div>		
				</div>
			{/if}
		{:else if currentInfo.meetingEnded}
			<div class="textContainer">
				<div class="title">thanks for the participation</div>
				<div class="text">The meeting has already ended.</div>		
			</div>
		{:else}
			<div class="textContainer">
				<div class="title">current topic</div>
				<div class="text">{currentInfo.title}</div>		
			</div>
			{#if typeof currentInfo.nextTitle != "undefined" }
				<div class="textContainer secondary">
					<div class="title">Next topic in {beautifyHMS( formatSecondsToHMS(currentInfo.remainingTime) )}</div>
					<div class="text">{currentInfo.nextTitle}</div>		
				</div>
			{:else}
				<div class="textContainer secondary">
					<div class="title">this is the last topic</div>
					<div class="text">End in {beautifyHMS( formatSecondsToHMS(currentInfo.remainingTime) )}</div>		
				</div>
			{/if}
			<div class="textContainer small">
				<div class="title">Estimated End</div>
				<div class="text">{currentInfo.endTime}</div>		
			</div>
		{/if}
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;700;800;900&display=swap'); /*100, 300, 400, 500, 600, 700, 800, 900*/
	
	:root,html,body {
		background: #114E60;
		height: 100%;
	}
	.container {
		text-align: center;
		color: #F4EEE8;
		font-family: 'Montserrat', sans-serif;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.textContainer {
		padding: 5px;
		margin: 20px 5px;
	}
	.textContainer.small {
		transform: scale(0.6);
	}
	.textContainer.secondary {
		opacity: 0.35;
	}
	.textContainer > .title {
		margin-bottom: 5px;
		text-transform: uppercase;
		color: #F5CEBE;
		font-weight: 600;
		letter-spacing: 0.25rem;
	}
	.textContainer > .text {
		font-size: 2.2rem;
		font-weight: 100;
	}
	
</style>