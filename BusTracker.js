/**
 * Created by Moloney on 1/18/2018.
 * Lab 8 Bus Tracker Angular JS
 * Dr. Hornick
 * SE-2840
 * Web Application Development
 */


/**
 * creating angular module called my module
 */
var myApp = angular.module('myApp', ['ui.bootstrap']);

/**
 * @module myApp
 * @description AngularJS controller, obtains and processes data to display bustracker data
 */
myApp.controller('busTracker', function ($scope, $http, $interval) {
    var map = null; //set map to null
    var markers = []; //set markers to null
    var timer = null; // set timer to null
    $scope.updateValue = 0; //set updateValue var to 0
    $scope.showErrorTable = false; //hides the error table
    $scope.showTable = false; //shows hides the data table
    var mapOptions = { // setting up how the google map will be seen on the screen
        zoom: 13,
        center: new google.maps.LatLng(43.044240, -87.906446),
        mapTypeControlOptions: {
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain', 'styled_map', 'styled_map2']
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions); // creating the map
    var startPosition = new google.maps.LatLng(43.044240, -87.906446);// location of MSOE athletic field
    msoeMarker(startPosition, "MSOE", "The place to be!");  // add a push-pin to the map
    $scope.doAjaxRequest = function () { //method that does an ajax request
        $scope.updateValue += 1; //increments the update value by 1
        $http({  //creating the ajax request using angular notation
            method: "GET", //the method type
            url: "http://sapphire.msoe.edu:8080/BusTrackerProxy/BusInfo", //url to make request to
            params: {"rt": $scope.entry, "key": key}, // we can also add params if needed: params eg: {"rt":31, "key":abcde123}
            crossDomain: true,
            async: true,
            dataType: "json", //the return data tye
        }).then(function mySuccess(response) { // here we are using an anonymous function rather than a named inner function
            try {
                var busData = response.data["bustime-response"];
                if (busData !== undefined && busData.error === undefined) {
                    //handles valid data
                    var busArray = busData['vehicle'];
                    $scope.busOnRoute = busArray;
                    $scope.showTable = true; //shows the table
                    $scope.showErrorTable = false; //hides the error table
                    //plots the buses returend into a map and puts them into a table
                    for (var i = 0; i < busArray.length - 1; i++) {
                        var lat = parseFloat(busArray[i].lat);
                        var lon = parseFloat(busArray[i].lon);
                        var position = new google.maps.LatLng(lat, lon); // creates a Google position object
                        addMarker(map, position, busArray[i].vid, busArray[i].des);
                    }
                    if (timer === null) {
                        //sets the interval timer to do req. every 5 seconds
                        timer = $interval(function () {
                            $scope.doAjaxRequest();
                        }, 5000);
                    }
                } else { //Handles user notifications of requests that could be sent but returned errors
                    if(markers.length != 0){ //remove markers from map if markers array is not zero
                        removeMakers();
                    }
                    //Errors below are for request that could be sent, but came back with errors
                    //parses the error response returned and saves it to scoped var so it can be displayed
                    $scope.showTable = false; //hides the data table
                    $scope.showErrorTable = true; //shows the error table
                    let errorArray = response.data["bustime-response"].error;
                    let errorMsg = errorArray[0];
                    if (response.data.rt !== undefined && response.data.message !== undefined) {
                        $scope.errTxt = response.data.message + " " + response.data.rt;
                    } else if (response.data.rt === undefined && response.data.msg !== undefined) {
                        $scope.errTxt = response.data.msg; //sets var to msg
                    }else if(errorMsg.msg !== undefined){
                        $scope.errTxt = errorMsg.msg; // sets var to msg
                    }
                }
            } catch (err) {
            if ("status" in response.data) {
                    $scope.errTxt = response.data.status; //sets to returned status

                }
            }
        }, function myError(response) { //Handles user notification for requests that could not be sent
            $scope.errorOccured = true;
            $scope.errTxt = response.status + " " + response.statusText;
        });
    }

    /**
     * Adds a marker to the map, deleted on click stop
     * @param map - the map to add the marker to
     * @param position - the postion to add the marker
     * @param title - the title to give the marker
     * @param content - the conents to give the marker
     */
    function addMarker(map, position, title, content) {
        var markerOptions = {
            position: position, // position of the push-pin
            map: map,	// the map to put the pin into
            title: title, // title of the pin
            icon: {
                // the url of the icon of the addMarker
                url: "https://cdn.vectorstock.com/i/1000x1000/81/30/london-bus-icon-vector-6678130.jpg",
                // the size of the icon marker
                scaledSize: new google.maps.Size(30, 30)
            },
            clickable: true // if true, enable info window pop-up
        };
        // create the push-pin marker
        var marker = new google.maps.Marker(markerOptions);
        markers.push(marker); //adds markers to the group of markers
        // now create the pop-up window that is displayed when you click the marker
        var infoWindowOptions = {
            content: content, // description
            position: position, // where to put it
        };
        var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

        //Adds listerner that displays window on click
        google.maps.event.addListener(marker, "click", function () {
            infoWindow.open(map); // opens th info window on a mouse click
        });
    } // end inner function addMarker

    /**
     * @param position - the position to add marker, not deleted after click stop
     * @param title - the title to give the marker
     * @param content - the contents to give the marker
     */
    function msoeMarker(position, title, content) {
        var markerOptions = {
            position: position, // position of the push-pin
            map: map,	// the map to put the pin into
            title: title, // title of the pin
            icon: {
                //the url of the image used for marker
                url: "https://pbs.twimg.com/profile_images/764983293238325248/6DuQyIX1_400x400.jpg",
                //the size of the icon
                scaledSize: new google.maps.Size(30, 30)
            },
            clickable: true // if true, enable info window pop-up
        };
        // create the push-pin marker
        var marker = new google.maps.Marker(markerOptions);

        // now create the pop-up window that is displayed when you click the marker
        var infoWindowOptions = {
            content: content, // description
            position: position, // where to put it
        };
        var infoWindow = new google.maps.InfoWindow(infoWindowOptions); //creating the info window
        google.maps.event.addListener(marker, "click", function () {
            infoWindow.open(map); //on click displays info window
        });
    } // end inner function msoeMarker

    /**
     * Stops the interval timer after a click
     */
    $scope.stopTimer = function () {
        $interval.cancel(timer); // This clears the interval
        timer = null; // this sets the timer var to null
        $scope.busOnRoute = null; //set data in that table uses to null
        $scope.errTxt = null; //set the contents of the error txt to null
        removeMakers();
        $scope.updateValue = 0; // sets the update number to zero
    }
    function removeMakers(){
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(null); // goes through the array of markers and removes them
      }
      markers = []; //sets the array of markers to an empty array
    }
});
//End of program



