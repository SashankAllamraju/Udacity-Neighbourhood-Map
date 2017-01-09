/* Data points for 9 locations on the Mumbai map */
var Model = {
  currentMarker: ko.observable(null),
  markers: [
    {
      title: 'Banganga Tank',
      lat: 18.945582,
      lng: 72.793758,
      url: 'https://en.wikipedia.org/wiki/Banganga_Tank',
      highlight: ko.observable(false)
    },
    {
      title: 'Elephanta Caves',
      lat: 18.963373,
      lng: 72.931474,
      url: 'https://en.wikipedia.org/wiki/Elephanta_Caves',
      highlight: ko.observable(false)
    },
    {
      title: 'Gateway Of India Mumbai',
      lat: 18.921975,
      lng: 72.834649,
      url: 'https://en.wikipedia.org/wiki/Gateway_of_India',
      highlight: ko.observable(false)
    },
    {
      title: 'The Asiatic Society of Mumbai',
      lat: 18.931838,
      lng: 72.836172,
      url: 'https://asiaticsociety.org.in/',
      highlight: ko.observable(false)
    },
    {
      title: 'Chhatrapati Shivaji Maharaj Vastu Sangrahalaya',
      lat: 18.926864,
      lng: 72.832608,
      url: 'https://www.csmvs.in/',
      highlight: ko.observable(false)
    },
    {
      title: 'Rajabai Clock Tower',
      lat: 18.929766,
      lng: 72.830142,
      url: 'https://en.wikipedia.org/wiki/Rajabai_Clock_Tower',
      highlight: ko.observable(false)
    },
    {
      title: 'Byculla Zoo',
      lat: 18.978871,
      lng: 72.834475,
      url: 'https://en.wikipedia.org/wiki/Jijamata_Udyaan',
      highlight: ko.observable(false)
    },
    {
      title: 'Hanging Garden',
      lat: 18.957122,
      lng: 72.804799,
      url: 'https://en.wikipedia.org/wiki/Hanging_Gardens_of_Mumbai',
      highlight: ko.observable(false)
    },
    {
      title: 'Haji Ali Dargah',
      lat: 18.982758,
      lng: 72.808951,
      url: 'https://www.hajialidargah.in/',
      highlight: ko.observable(false)
    }
  ]
};
