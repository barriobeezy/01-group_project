

////////////////////////////Google Maps Initial Setup///////////////////////////////////////////

var map;
function initMap() {};
function initMap() {
    var myLatLng = {lat: 40.747, lng: -111.89};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: myLatLng
    });
}

// clear data in modal with clear button
$("#clear").on('click', function(){
    $("#modal-info").clear();
});

//This function takes in a location and uses a Geocoding API to retrieve the LONGITUDE of that location
function geo(x, state, func){
    var output;
    var input = x;
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": " https://nominatim.openstreetmap.org/search?country="+input+"&format=json",
        "method": "GET" 
        }

    $.ajax(settings).done(function (response) {
    rando = (Math.random() * .5)
    output = parseInt(response[0].lon) + rando
    
    if (state) {
        func(output)
    }
    
    });

    return(output)
}

//This function takes in a location and uses a Geocoding API to retrieve the LATITUDE of that location
function geoToo(x, state, func){
    var output;
    var input = x;
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": " https://nominatim.openstreetmap.org/search?country="+input+"&format=json",
        "method": "GET"
        }

    $.ajax(settings).done(function (response) {
    rando = (Math.random() * .5)
    output = parseInt(response[0].lat) + rando

    if (state) {
        func(output)
    }

    });

    return(output)
}

//This is the drone strike API
var queryURL =  "api.dronestre.am/data "

//these are empty arrays awaiting data to be pushed by the API
    var locations = [];
    var places = [];
    var country = [];
    var narrative = [];
    var killed = [];
    var link = [];
    var lonArray = [];
    var latArray = [];

                            
    $("#close").on('click', function(){
        $("#modal-info").empty();
    });

    $("#add-data").on("click", function(event) {
        
        lonArray = [];
        latArray = [];
        event.preventDefault();

//This is cleaning up the user inputed dates so that it can be used to query dronestr.am
        var userBeginMessy = $("#startDate").val()
        var userBeginMessytoo = userBeginMessy.replace("-", "")
        var userBegin = userBeginMessytoo.replace("-", "")
        var userEndMessy = $("#endDate").val()
        var userEndMessytoo = userEndMessy.replace("-", "")
        var userEnd = userEndMessytoo.replace("-", "")

    $.ajax({
    method: "GET",
    url: "https://cors-anywhere.herokuapp.com/https://api.dronestre.am/data",
    }).then(function(data) {
        console.log(data);

    var drone = data.strike;
    var droneLength = drone.length;

    //this for loop runs through the entire dronestre.am JSON 
    for (n =0; n < droneLength; n++){

        var droneDate = data.strike[n].date;
        var droneYear = droneDate.substring(0,10).toString();   
        var dateSlice = droneYear.replace("-", "");
        //dateSliceToo is the date minus the dashes 
        var dateSliceToo = dateSlice.replace("-", "");
        var lon = data.strike[n].lon;
        var lat = data.strike[n].lat;
        var dronePlace = data.strike[n].location;
        var droneCountry = data.strike[n].country;
        var droneNarrative = data.strike[n].narrative
        var death = data.strike[n].deaths
        var dronelink = data.strike[n].bij_link

        //this if statement finds data between the two inputed dates and pushes the selected data to the empty arrays made above
        if (dateSliceToo>=userBegin && dateSliceToo<=userEnd) {

            lonArray.push(lon);
            latArray.push(lat); 
            locations.push([lon, lat]);
            country.push([droneCountry]);
            places.push([dronePlace]);
            narrative.push([droneNarrative]);
            killed.push([death]);
            link.push([dronelink]);

        }
    } 

    console.log("this is the longitudinal array "+lonArray)
    console.log("this is the latitudinal array "+latArray)

//this summitlon function will search the longitude array for any empty value and replace it with the longitude of the location

    function summitlon(x) {
        var sumLength = x.length;

        for(var z=0; z<sumLength; z++) {
//function(z) is keeping z constant for the duration of this function(including the API call) to deal with asynchronous issues of having an API call within an API call
            (function(z){
                var test = x[z]/10;
//test is checking if the value of the longitude divided by ten is zero. If so it triggers this if statement to replace the empty data with new data
                if (test==0) {

                    places.splice(z, 1,country[z])
                    locationInput = country[z].toString()
            
                        geo(locationInput, true, function(lon){
    
                            x[z] = lon.toString()
                            console.log("longitudinal array "+x)
                            setTimeout(lon, 1000)

                        });
                }
            }(z))
        }
    }
//this summitlon function will search the latitudinal array for any empty value and replace it with the longitude of the location

    function summitlat(x) {
        var sumLength = x.length;
        for(var z=0; z<sumLength; z++) {

//function(z) is keeping z constant for the duration of this function(including the API call) to deal with asynchronous issues of having an API call within an API call
            (function(z){
                var test = x[z]/10;
//test is checking if the value of the latitude divided by ten is zero. If so it triggers this if statement to replace the empty data with new data
                if (test==0) {

                    locationInput = country[z].toString()

                        geoToo(locationInput, true, function(lat){

                            x[z] = lat.toString() 
                            console.log("Latitudinal array "+x)
                            setTimeout(lat, 1000)
                        });
                }
            }(z))
        }
    }

    //this runs both of the summit functions on the latitude and longitude 
    summitlon(lonArray)
    summitlat(latArray)
        
    //this interval checks the if statement every 2 seconds
    var interval = setInterval(function() {

    //this if statement checks the latArray for empty blank spaces. If there are no blank spaces in the array latArray.indexOf("") will output -1 and trigger the map
    //this was put into place to ensure that the data was corrected from the (possibly) corrupted form into a google maps useable form before pushing it to google maps
    if (latArray.indexOf("")==-1){

        //starts auto zoom
        bounds  = new google.maps.LatLngBounds();

        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 2,
            center: new google.maps.LatLng(0,0),
            mapTypeId: google.maps.MapTypeId.ROADMAP
            });
    
            var infowindow = new google.maps.InfoWindow();
            var marker, i;
    
                for (i = 0; i < locations.length; i++) {
                    marker = new google.maps.Marker({
                    position: new google.maps.LatLng( latArray[i], lonArray[i]),
                    map: map
                });

                //extends the bounds of the map if a new marker displays
                loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng()); bounds.extend(loc);
        
                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                    return function() {
                        infowindow.setContent(places[i][0]);
                        infowindow.open(map, marker);

                        $('#modal-info').append(" ", "  Strike narrative:  ", narrative[i],"<br>","  Number killed  ", killed[i], "!", "<br>", "Article about strike:  ", link[i]);
                    }
                })(marker, i));

                //calls auto zoom
                map.fitBounds(bounds);
                map.panToBounds(bounds);

                }

            clearInterval(interval);
            }
        }, 2000);
    });
});

//this function allows you to use your mobile browser (not chrome or safari) and be responsive still
$(function () {
    var nua = navigator.userAgent
    var isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1)
    
    if (isAndroid) {
        $('select.form-control').removeClass('form-control').css('width', '100%')
    }
});
