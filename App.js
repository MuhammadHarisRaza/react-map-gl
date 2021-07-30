import "./app.css";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { useEffect, useState, useRef } from "react";
import { Room, Star, StarBorder } from "@material-ui/icons";
import axios from "axios";

function App() {
  const myStorage = window.localStorage;
  const [currentUsername, setCurrentUsername] = useState(myStorage.getItem("user"));
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [viewport, setViewport] = useState({
    latitude: 47.040182,
    longitude: 17.071727,
    zoom: 4,
  });
  const reactMap = useRef(null);
  const [addressMarker, setAddressMarker] = useState([])
  const [search, setSearch] = useState("")
  const addressData =[
    {id:1, address:"Multan"},
    {id:2, address:"Islamabad"},
    {id:3, address:"Karachi"},
    {id:4, address:"Lahore"},
  ]
  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lat: latitude,
      long: longitude,
    });
  };



  const drawBoundingBox = (address) =>{

      axios.get(`https://nominatim.openstreetmap.org/search.php?q=${address}&polygon_geojson=1&format=json`)
        .then(function (response) {
          // handle success
          console.log(response);
          console.log(reactMap)
          let map = reactMap.current
          map.addSource('polygon',{
            type:'geojson',
            data:{
              type:'Feature',
              geometry:response.data[0].geojson
            }
          })
          map.addLayer({
            "id": "polygon",
            "type": "fill",
            "source": "polygon",
            "source-layer": "polygon",
            "layout": {
                "visibility": "visible"
            },
            "paint": {},
            "interactive": true
          })
          if (map.getSource("polygon")) {
            map.removeSource("polygon");
          }
          if (map.getLayer("polygon")) {
              map.removeLayer("polygon");
          }
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
  }

  useEffect(() => {
    console.log('search hook')
    drawBoundingBox(search)
  },[search])

  useEffect(() => {
    let newAddressData = []
    addressData.map((address)=>{
      axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address.address}.json?access_token=pk.eyJ1IjoicmF6YWhhcmlzMTMyIiwiYSI6ImNrcjg1N3ZyMTN3OGgzMWwzd25uZ2IwdWQifQ.PaxDSpsvN4umPjzocmELtw`)
      .then((response) =>{
        console.log(response);
        newAddressData.push({
          ...address,
          longitude:response.data.features[0].center[0],
          latitude:response.data.features[0].center[1]
        })
      })
      .catch((err) =>{
        console.log(err);
      })
    })
    console.log("new array >>", newAddressData)
    setAddressMarker(newAddressData)
    console.log("set", setAddressMarker)
  }, []);


  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <input 
        type="text" 
        placeholder="search..."
        onChange={(event) =>{
          setSearch(event.target.value);
        }}
      />
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken="pk.eyJ1IjoicmF6YWhhcmlzMTMyIiwiYSI6ImNrcjg1N3ZyMTN3OGgzMWwzd25uZ2IwdWQifQ.PaxDSpsvN4umPjzocmELtw"
        width="100%"
        height="100%"
        transitionDuration="200"
        mapStyle="mapbox://styles/safak/cknndpyfq268f17p53nmpwira"
        onViewportChange={(viewport) => setViewport(viewport)}
        onDblClick={currentUsername && handleAddClick}
        ref={ref => reactMap.current = ref && ref.getMap()}
      >
        {addressMarker.map((addressM)=>(
          <Marker
          latitude={addressM.latitude}
          longitude={addressM.longitude}
          offsetLeft={-3.5 * viewport.zoom}
          offsetTop={-7 * viewport.zoom}
          >
            <img
              style={{height:50, width:50}}
              src="https://w7.pngwing.com/pngs/731/25/png-transparent-location-icon-computer-icons-google-map-maker-marker-pen-cartodb-map-marker-heart-logo-color-thumbnail.png"
            />
          </Marker>
        ))}
      </ReactMapGL>
    </div>
  );
}

export default App;
