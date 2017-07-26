const app = {};
app.apiUrl = "https://api.spotify.com/v1";

var headers = {};

app.init = function(){
	$.ajax({
		url: "http://proxy.hackeryou.com",
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		data: JSON.stringify({
			reqUrl: 'https://accounts.spotify.com/api/token',
			params:{
				grant_type: 'client_credentials'
			},
			proxyHeaders: { 
				"Authorization" : "Basic YmVmYjg4OGU4ZWRmNDE0MThmMDNlYjdlN2Y5ZWU4YzQ6MjRlOWY4ODljNzU5NGVlMTk3N2Q5ODk1ZmE0Y2E2NTg="
			}
		})
	})
	.then((res) => {
		headers = {
			"Authorization" : `${res.token_type} ${res.access_token}`
		}

		app.modalQuery();
		//keep main hidden 
		
	})
	
};

app.modalQuery = function(){
	// auto complete searches
	// app.displayMatches();

	// wait for user submit
	$("#modal-artist-search").on("submit", event => {
		$('#info-modal').fadeOut(300);
		$('main').removeClass("hidden"); 
		event.preventDefault();

		// hide search results if searched before - animation effects to take in place 
		$("#main-artist, #related-artists").addClass("hidden")
		
		let query = $("#artist-input").val(); //store value for query purposes
		$("#artist-input").val(""); //clear text box
		topFunction();
		app.getArtistID(query); // find Artist ID from user search
		app.userQuery(); 
	});

};

// get user's artist search
app.userQuery = function(){
	// auto complete searches
	// app.displayMatches();

	// wait for user submit
	$("#artist-search").on("submit", event => {
		event.preventDefault();

		// hide search results if searched before - animation effects to take in place 
		$("#main-artist, #related-artists").addClass("hidden")
		
		let query = $("#artist-input2").val(); //store value for query purposes
		$("#artist-input2").val(""); //clear text box

		app.getArtistID(query); // find Artist ID from user search
		app.clickArtistNameSearch();
		app.userQuery();
	});

};

 // get searched artist ID 
app.getArtistID = function(query){
	$.ajax({
		url: `${app.apiUrl}/search`,
		method: "GET",
		headers,
		dataType: "json",
		data: {
			type: "artist",
			q: query,
			limit: 1,
		}
	})
	.then(res => {
		let mainArtist_ID = res.artists.items["0"].id;
		// pass artist ID to find related artists
		app.getRelatedArtist(mainArtist_ID); 


		let mainArtist = { // store relevant values
			name: res.artists.items["0"].name,
			uri: res.artists.items["0"].uri,
			photo: res.artists.items["0"].images["1"].url,
		};

		//render template
		app.displayMainArtist(mainArtist);
	});
};

//get related artists
app.getRelatedArtist = function(id){
	$.ajax({
		url: `${app.apiUrl}/artists/${id}/related-artists`,
		method: 'GET',
		headers,
		dataType: 'json',
	})
	.then(res => {
		const artists = res.artists.map(artist => {
			return {
				'name': artist.name,
		    	'id': artist.id,
		    	'photo': artist.images["1"].url,
		    	'uri': artist.uri,
			}
		});
		//render template 
		app.displayRelatedArtists(artists)

	});
};

app.clickArtistNameSearch = function(id) { 

	$("#main-artist, #related-artists").addClass("hidden") //WHY ARE THERE TWO OF THE SAME LINES HERE

	$.ajax({
		url: `${app.apiUrl}/artists/${id}`,
		method: "GET",
		headers,
		dataType: "json",
	})
	.then(res => {
		let mainArtist = { // store relevant values
			name: res.name,
			uri: res.uri,
			photo: res.images["1"].url,
		};

		$("#main-artist, #related-artists").addClass("hidden") //WHY ARE THERE TWO OF THE SAME LINES HERE
		app.displayMainArtist(mainArtist);
		app.getRelatedArtist(id);
	})
};

app.displayMainArtist = function(artist) {
	const source = $("#main-artist-template").html();
	const template = Handlebars.compile(source);
    const html = template(artist);
    $("#main-artist").html(html);
	$("body").css('background', `linear-gradient(rgba(210, 199, 200, 0.8),rgba(210, 199, 200, 0.8)), url(${artist.photo}) fixed no-repeat center/cover`);
};

//compiling related artists list with array of artist objects
app.displayRelatedArtists = function(artists) {
	const source = $("#related-artists-template").html();
	const template = Handlebars.compile(source);
    const artistContext = {"artist": artists}
    const html = template(artistContext);
	$("#related-artists").html(html);
	$("#main-artist, #related-artists").removeClass("hidden");	
};


// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function(){
	scrollFunction()
};

function scrollFunction() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// ----- DOCUMENT READY ----- 
$(function(){
	app.init();
});
