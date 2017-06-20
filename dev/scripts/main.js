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
				"Authorization" : "Basic ODc2ZmRjNmRjNDNiNDZmMDliYWFhYTZhN2IzYjExMjk6MzkwYWJmYzFkODAzNDdiY2FmYmNlODZjMmFjODU0OGI="
			}
		})
	})
	.then((res) => {
		headers = {
			"Authorization" : `${res.token_type} ${res.access_token}`
		}

		app.userQuery();
		app.clickArtistNameSearch();
	})
	
};

// get user's artist search
app.userQuery = function(){
	// auto complete searches
	// app.displayMatches();

	// wait for user submit
	$("#artist-search").on("submit", event => {
		app.removeOpeningClasses(); 
		event.preventDefault();

		// hide search results if searched before - animation effects to take in place 
		$("#main-artist, #related-artists").addClass("hidden")
		
		let query = $("input[type='text']").val(); //store value for query purposes
		$("#artist-input").val(""); //clear text box

		
		app.getArtistID(query); // find Artist ID from user search
	});

};
app.removeOpeningClasses = function() {
	$("aside").removeClass("opening");
	$("#artist-search").removeClass("opening-form");
}
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

	$("#main-artist, #related-artists").addClass("hidden")
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
		$("#main-artist, #related-artists").addClass("hidden")
		app.displayMainArtist(mainArtist);
		app.getRelatedArtist(id);
	})
};

app.displayMainArtist = function(artist) {
	const source = $("#main-artist-template").html();
	const template = Handlebars.compile(source);
    const html = template(artist);
    $("#main-artist").html(html);
	$("body").css('background', `linear-gradient(rgba(210, 199, 200, 0.8),rgba(210, 199, 200, 0.8)), url(${artist.photo}) no-repeat center/cover`);
};

app.displayRelatedArtists = function(artists) {
	const source = $("#related-artists-template").html();
	const template = Handlebars.compile(source);
    const artistContext = {"artist": artists}
    const html = template(artistContext);
	$("#related-artists").html(html);
	$("#main-artist, #related-artists").removeClass("hidden");
	$("aside").addClass("searched");	
};

// ----- DOCUMENT READY ----- 
$(function(){
	app.init();
	app.clickArtistNameSearch();

});
