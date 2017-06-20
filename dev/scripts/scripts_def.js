const app = {};
app.apiUrl = "https://api.spotify.com/v1";

app.init = function(){
	app.userQuery();
	app.clickArtistNameSearch();
};

// get user's artist search
app.userQuery = function(){
	// auto complete searches
	// app.displayMatches();

	// wait for user submit
	$("#artist-search").on("submit", event => {
		event.preventDefault();
		// hide search results - animation effects to take in place 

		$("#main-artist, #related-artists").addClass("hidden")
		let query = $("input[type='text']").val();
		$("#artist-input").val("");
		app.getArtistID(query); // find Artist ID from user search
	});
};

 // get searched artist ID 
app.getArtistID = function(query){
	$.ajax({
		url: `${app.apiUrl}/search`,
		method: "GET",
		dataType: "json",
		data: {
			type: "artist",
			q: query,
			limit: 1,
		}
	})
	.then(res => {

		let mainArtist = { // store relevant values
            id: res.artists.items["0"].id,
			name: res.artists.items["0"].name,
			uri: res.artists.items["0"].uri,
			photo: res.artists.items["0"].images["0"].url,
		};

        return $.Deferred().resolve(mainArtist);
	}).then(mainArtist => {
		app.getRelatedArtist(mainArtist.id)
            .then(relatedArtists => {
                app.displayMainArtist(mainArtist);
                app.displayRelatedArtists(relatedArtists);
            });
    });
};

//get related artists
app.getRelatedArtist = function(id){
	return $.ajax({
		url: `${app.apiUrl}/artists/${id}/related-artists`,
		method: 'GET',
		dataType: 'json',
	})
	.then(res => {
		const artists = res.artists.map(artist => {
			return {
				'name': artist.name,
		    	'id': artist.id,
		    	'photo': artist.images["0"].url,
		    	'uri': artist.uri,
			}
		});
        return $.Deferred().resolve(artists);
	});
};

app.clickArtistNameSearch = function(id) {

	$("#main-artist, #related-artists").addClass("hidden")
	$.ajax({
		url: `${app.apiUrl}/artists/${id}`,
		method: "GET",
		dataType: "json",
	})
	.then(res => {
		let mainArtist = { // store relevant values
            id: id,
			name: res.name,
			uri: res.uri,
			photo: res.images["1"].url,
		};
        return $.Deferred().resolve(mainArtist);
	})
    .then(mainArtist => {
		app.getRelatedArtist(mainArtist.id).then(relatedArtists => {
            app.displayMainArtist(mainArtist);
            app.displayRelatedArtists(relatedArtists);
        });
    });
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


});
