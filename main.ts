import L, { geoJson } from 'leaflet';
import {Util as esriLeafletUtil} from 'esri-leaflet';
import { featureLayer, basemapLayer, get } from 'esri-leaflet';
import * as esriLeaflet from 'esri-leaflet';
import setupEvents from './event-setup';
import createSearcher from './search-setup';
import {getFeatureServiceLayers} from './layer-provider';
L.Icon.Default.imagePath = 'jspm_packages/npm/leaflet@1.0.0-rc.1/dist/images';

var map = L.map('map').setView([38.090294, 77.267569], 12);

const portalSyskey = 41;

var polygons = featureLayer({
  url: '//services1.arcgis.com/R293DznM2zjfdFQ4/arcgis/rest/services/client41_public_basemap/FeatureServer/0',
  style: function (feature) {
    var color = 'blue';
    const weight = 2;
    if (feature.properties.F_Area_ID) {
      if (feature.properties.F_Area_ID.length === 2) {
        color = 'green';
      } else if (feature.properties.F_Area_ID.length === 3) {
        color = 'red';
      } else {
        color = 'blue';
      }
    }
    else if (feature.properties.Status) {
      color = feature.properties.Status === 'Closed Areas' ? 'red' : color;
    }
    return { color, weight };
  }
});
polygons.addTo(map);
var points = featureLayer({
  url: '//services1.arcgis.com/R293DznM2zjfdFQ4/arcgis/rest/services/client41_all_LocationsPolygons_labels/FeatureServer/0'
}).addTo(map);
points.addTo(map);

var baseMaps = {
  "Streets": basemapLayer("Streets"),
  "Topographic": basemapLayer("Topographic")
};

var overlayMaps = {
  "TAs": polygons,
  "Gates": points
};

baseMaps["Streets"].addTo(map);

L.control.layers(baseMaps, overlayMaps).addTo(map);
L.control.scale().addTo(map);

polygons.bindPopup(function (feature) {
  return esriLeafletUtil.template('<p>{F_Area_ID}<br>{F_label}<br>{Use_Restri}<br>More stuff here!</p>', feature.properties);
});
points.bindPopup(function ({feature}) {
  return L.Util.template('<p>Gate {F_Area_ID}<br>{TA}<br><br>More stuff here!</p>', feature.properties);
});

polygons.on('mouseout', function (e) {
  document.getElementById('info-pane').innerHTML = 'Hover to Inspect';
});

var oldId;
polygons.on('mouseover', function (e) {
  polygons.resetStyle(oldId);
  oldId = e.layer.feature.id;
  document.getElementById('info-pane').innerHTML = e.layer.feature.properties["F_label"];
  e.layer.bringToFront();
  polygons.setFeatureStyle(e.layer.feature.id, {
    color: 'yellow',
    weight: 3,
    opacity: 1
  });
});

var labels = {};
polygons.on('createfeature', function (e) {
  var id = e.feature.id;
  var feature = polygons.getFeature(id);
  var center = feature.getBounds().getCenter();
  var label = L.marker(center, {
    icon: L.divIcon({
      iconSize: null,
      className: 'label',
      html: '<div>' + e.feature.properties.F_Area_ID + '</div>'
    })
  }).addTo(map);
  labels[id] = label;
});

polygons.on('addfeature', function (e) {
  var label = labels[e.feature.id];
  if (label) {
    label.addTo(map);
  }
});

polygons.on('removefeature', function (e) {
  var label = labels[e.feature.id];
  if (label) {
    map.removeLayer(label);
  }
});



// // create map

// // add basemap
basemapLayer('Topographic').addTo(map);
// add layer
// get(`//www.arcgis.com/sharing/content/items/${guid}/data`, { f: 'json' }, (error, response) => {
//   var idField = response.operationalLayers[0].featureCollection.layers[0].layerDefinition.objectIdField;

//   var features = response.operationalLayers[0].featureCollection.layers[0].featureSet.features;

//   // empty geojson feature collection
//   var featureCollection = {
//     type: 'FeatureCollection',
//     features: []
//   };

//   for (var i = features.length - 1; i >= 0; i--) {
//     // convert ArcGIS Feature to GeoJSON Feature
//     var feature = esriLeafletUtil.arcgisToGeoJSON(features[i], idField);

//     // unproject the web mercator coordinates to lat/lng
//     feature.geometry.coordinates = feature.geometry.coordinates
//       .filter(isManagedLayer)
//       .map(L.point)
//       .map(L.Projection.Mercator.unproject)
//       .map(({lng, lat}) => [lng, lat]);

//     featureCollection.features.push(feature);
//     var geojson = L.geoJson(featureCollection).addTo(map);
//     // map.fitBounds(geojson.getBounds());
//   }

//   var baseMaps = {
//     "Streets": basemapLayer("Streets"),
//     "Topographic": basemapLayer("Topographic")
//   };

//   var overlayMaps = {
//     "areas": areas,
//     "Gates": points
//   };

baseMaps["Streets"].addTo(map);

L.control.layers(baseMaps, overlayMaps).addTo(map);
L.control.scale().addTo(map);

polygons.bindPopup(area => {
  return L.Util.template('<p>{F_Area_ID}<br>{F_label}<br>{Use_Restri}<br>More stuff here!</p>', area.feature.properties);
}).addTo(map);

//   points.bindPopup(point => {
//     return L.Util.template('<p>Gate {F_Area_ID}<br>{F_label}<br>{Use_Restri}<br>More stuff here!</p>', point.feature.properties);
//   }).addTo(map);



// });
setupEvents(polygons, map);
function isManagedLayer({ title }) {
  return title && (title.indexOf("Managed Labels", 0) >= 0
    || title.indexOf("ManagedLines", 0) >= 0
    || isManagedPolygon({ title })
    || isManagedPoint({ title }));
}

function isManagedPoint({ title }) {
  return title && title.indexOf("ManagedPoints", 0) >= 0;
}
function isManagedPolygon({ title }) {
  return title && title.indexOf("ManagedPolygons", 0) >= 0;
}
// createSearcher().addTo(map);





















  // var featureLayers = {
  //   type: 'FeatureLayer',
  //   features: []
  // };
  // response.operationalLayers
  //   .filter(isManagedLayer)
  //   .forEach(featureCollection => {
  //     var features = featureCollection.featureCollection.layers[0].featureSet.features
  //       .filter(isManagedLayer);

  //     features.forEach(feature => {
  //       // convert ArcGIS Feature to GeoJSON Feature
  //       feature = esriLeafletUtil.arcgisToGeoJSON(feature, idField);
  //       // unproject the web mercator coordinates to lat/lng
  //       feature.geometry.coordinates = feature.geometry.coordinates
  //         .map(L.point)
  //         .map(L.Projection.Mercator.unproject)
  //         .map(({lng, lat}) => [lng, lat]);

  //       // featureCollection.features.push(feature);

  //       if (isManagedPoint(feature)) {
  //         points.push(feature);
  //       } else if (isManagedPolygon(feature)) {
  //         areas.push(feature);
  //       }
  //     });
  //     var geojson = L.geoJson(featureCollection).addTo(map);

  //     // map.fitBounds(geojson.getBounds());
  //   });