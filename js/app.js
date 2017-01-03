/********************************* VIEW MODEL ********************************************/
var ViewModel = function() {
  var self = this;
  var map, geocoder, bounds, infowindow;

  self.currentPhotos = ko.observableArray();
  self.lightboxUrl = ko.observable('');
  self.lightboxVisible = ko.observable(false);
  self.mapUnavailable = ko.observable(false);
  self.markerArray = ko.observableArray();
  self.nextArrowVisible = ko.observable(true);
  self.prevArrowVisible = ko.observable(true);
  self.query = ko.observable('');
  self.showList = ko.observable(true);


      var mapOptions = {
        disableDefaultUI: true
      };
      map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      geocoder = new google.maps.Geocoder();
      bounds = new google.maps.LatLngBounds();
      infowindow = new google.maps.InfoWindow({
        content: null
      });

      var markerList = Model.markers;
      for(var x = 0; x < markerList.length; x++) {
        var markPos = new google.maps.LatLng(
          markerList[x].lat,
          markerList[x].lng
        );

        var marker = new google.maps.Marker({
          position: markPos,
          map: map,
          icon: 'img/072-location.png',
          title: markerList[x].title,
          url: markerList[x].url,
          highlight: markerList[x].highlight
        });

        /*
        Add click event listener to create infowindow for each marker object.
        Use Google geocoder to pull physical address from lat/lng position data.
        If valid data returned, set infowindow with formatted address.
        Else, use default "unable to pull address" message.
          */
        google.maps.event.addListener(marker, 'click', function() {

          var that = this;
          geocoder.geocode({'latLng': that.position}, function(results, status) {
            if(status == google.maps.GeocoderStatus.OK) {
              if (results[0]){
                var address = results[0].formatted_address;
                var split = address.indexOf(',');
                infowindow.setContent("<span class='title'>" + that.title +
                  "</span><br>" + address.slice(0,split) + "<br>" +
                  (address.slice(split+1).replace(', India','')) +
                  "<br><a href=" + that.url + ">" + that.url + "</a><br>");
              }
            } else {
              infowindow.setContent("<span class='title'>" + that.title +
                "</span><br><<Unable to pull address at this time>><br><a href=" +
                that.url + ">" + that.url + "</a><br>");
            }
          });

          clearMarkers();

          // Modify marker (and list) to show selected status.
          that.setIcon('img/073-location2.png');
          that.highlight(true);

          infowindow.open(map, that);

          // Move map viewport to center selected item.
          map.panTo(that.position);
          Model.currentMarker(that);
        });

        /*
        Add click event for closing infowindow with X in top right of box.
        This function will clear any selected markers, and
        recenter the map to show all markers on the map.
          */
        google.maps.event.addListener(infowindow, 'closeclick', function() {
          clearMarkers();
          map.panTo(bounds.getCenter());
          map.fitBounds(bounds);
        });

        // Modify map viewport to include new map marker
        bounds.extend(markPos);

        //Add marker to array
        self.markerArray.push(marker);
      }
      //Resize map to fit all markers, then center map
      map.fitBounds(bounds);
      map.setCenter(bounds.getCenter());

      //Check window size
      checkWindowSize();

  /*
  Knockout computed observable will filter and return items that match the query string input by the user.
  This list will be used to update the list of locations shown.
    */
  self.filteredArray = ko.computed(function() {
    return ko.utils.arrayFilter(self.markerArray(), function(marker) {
      return marker.title.toLowerCase().indexOf(self.query().toLowerCase()) !== -1;
    });
  }, self);

  /*
  Subscribing to the filteredArray changes will allow for showing or hiding the associated markers on the map itself.
    */
  self.filteredArray.subscribe(function() {
    var diffArray = ko.utils.compareArrays(self.markerArray(), self.filteredArray());
    ko.utils.arrayForEach(diffArray, function(marker) {
      if (marker.status === 'deleted') {
        marker.value.setMap(null);
      } else {
        marker.value.setMap(map);
      }
    });
  });

  //Highlight map marker if list item is clicked.
  self.selectItem = function(listItem) {
    google.maps.event.trigger(listItem, 'click');
  };

  //Toggle showing marker list when up/down arrow above list is clicked.
  self.toggleList = function() {
    self.showList(!self.showList());
  };

  // Get Flickr photos to match location of selected marker.
  self.getPictures = function() {
    var marker = Model.currentMarker();
    if(marker !== null) {
      var textSearch = marker.title.replace(' ','+');

      /*
      Create search URL using marker title as text search, and
      marker position for lat/lng geolocation match of photos within 1 km of position.
      Replace API key with yours
        */
      var searchUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search' +
        '&api_key=1f497d979d6e25a0ece9b635d852493c&text=' + textSearch +
        '&license=1%2C2%2C3%2C4%2C5%2C6%2C7&content_type=1&lat=' + marker.position.lat() +
        '&lon=' + marker.position.lng() + '&radius=1&radius_units=km&per_page=15&page=1' +
        '&format=json&nojsoncallback=1';

      /*
      Use async call to get flickr photo data in JSON format.
      If successful, call unction to parse results, then display first photo.
      If failed, alert user.
        */
      $.getJSON(searchUrl)
        .done(function(data) {
          parseSearchResults(data);
          self.lightboxUrl(self.currentPhotos()[0]);
          self.lightboxVisible(true);
        })
        .fail(function(jqxhr, textStatus, error) {
          alert("Cannot load photos from Flickr at this time.");
        });
    } else {
      // If no marker chosen when trying to retrieve photos, alert user.
      alert("Select a location first and then click the Flickr button");
    }
  };

  /*
  When the 'X' above the photo is clicked, Close the lightbox and clear the currentPhotos array .
    */
  self.closeLightbox = function() {
    self.currentPhotos.removeAll();
    self.lightboxVisible(false);
    self.lightboxUrl('');
  };

  /*
  Choose the next photo in the currentPhotos array
  to be displayed when the right arrow is clicked.
  If at the end of the currentPhotos array, the following photo will loop to the start of the array
    */
  self.nextPhoto = function() {
    var i = self.currentPhotos.indexOf(self.lightboxUrl());
    if(i !== self.currentPhotos().length-1){
      self.lightboxUrl(self.currentPhotos()[i+1]);
    }else{
      self.lightboxUrl(self.currentPhotos()[0]);
    }
  };

  /*
  Choose the previous photo in the currentPhotos array,
  to be displayed when the left arrow is clicked.
  If at the beginning of the currentPhotos array, the new photo will loop to the end of the array
    */
  self.prevPhoto = function() {
    var i = self.currentPhotos.indexOf(self.lightboxUrl());
    if(i !== 0) {
      self.lightboxUrl(self.currentPhotos()[i-1]);
    }else{
      self.lightboxUrl(self.currentPhotos()[self.currentPhotos().length-1]);
    }
  };

  /*
  Helper function to take data from flickr JSON call, and form valid JPG links
  to show photos when the user clicks on the flickr button.
    */
  function parseSearchResults(data) {
    ko.utils.arrayForEach(data.photos.photo, function(photo) {
      var photoLink = 'https://farm' + photo.farm + '.staticflickr.com/'
        + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg';
      self.currentPhotos.push(photoLink);
    });
  }

  /*
  Helper function used to reset all markers to default image, clear color
  highlight from the list of locations, and reset the currentMarker variable.
    */
  function clearMarkers() {
    for(var x = 0; x < self.markerArray().length; x++){
      self.markerArray()[x].setIcon('img/072-location.png');
      self.markerArray()[x].highlight(false);
    }
    Model.currentMarker(null);
  }

  /*
  Helper function to check viewport width, called only on initialization of map.
  If lower than 480px (most likely mobile browser), toggle list to collapsed view.
    */
  function checkWindowSize() {
    if($(window).width() < 480){
      self.showList(false);
    }
  }
};



/* initMap */
function initMap() {
  ko.applyBindings(new ViewModel());
}

/* on error */
function mapError() {
  alert('Something went wrong! Please TRY later or Check your code!')
}
