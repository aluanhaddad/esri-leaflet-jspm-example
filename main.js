/*
 * Copyright 2015 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.​
 */

import L, {geoJson} from 'leaflet';
import { featureLayer, basemapLayer, get} from 'esri-leaflet';
import {Util as esriLeafletUtil} from 'esri-leaflet';

import setupEvents from './event-setup';
import createSearcher from './search-setup';

L.Icon.Default.imagePath = 'jspm_packages/npm/leaflet@1.0.0-rc.1/dist/images';

var map = L.map('map').setView([38.090294, -77.267569], 12);


var areas = featureLayer({
  url: '//services1.arcgis.com/R293DznM2zjfdFQ4/arcgis/rest/services/FAPHManagedPolygons/FeatureServer/0',
  style: function (feature) {
    return {
      weight: 2,
      color: feature.properties.F_Area_ID.length === 2 ? 'grey'
        : feature.properties.F_Area_ID.length === 3 ? 'red' : 'blue'
    };
  }
}).addTo(map);

var points = featureLayer({
  url: '//services1.arcgis.com/R293DznM2zjfdFQ4/arcgis/rest/services/FAPHManagedPoints/FeatureServer/0'
}).addTo(map);

// // create map

// // add basemap
// basemapLayer('Topographic').addTo(map);
var guid = "14d1d44cf9e3484ab10245103062dd63";
// add layer
get(`//www.arcgis.com/sharing/content/items/${guid}/data`, { f: 'json' }, (error, response) => {
  var idField = response.operationalLayers[0].featureCollection.layers[0].layerDefinition.objectIdField;
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
  var features = response.operationalLayers[0].featureCollection.layers[0].featureSet.features;

  // empty geojson feature collection
  var featureCollection = {
    type: 'FeatureCollection',
    features: []
  };

  for (var i = features.length - 1; i >= 0; i--) {
    // convert ArcGIS Feature to GeoJSON Feature
    var feature = esriLeafletUtil.arcgisToGeoJSON(features[i], idField);

    // unproject the web mercator coordinates to lat/lng
    feature.geometry.coordinates = feature.geometry.coordinates
      .filter(isManagedLayer)
      .map(L.point)
      .map(L.Projection.Mercator.unproject)
      .map(({lng, lat}) => [lng, lat]);

    featureCollection.features.push(feature);
    var geojson = L.geoJson(featureCollection).addTo(map);
    // map.fitBounds(geojson.getBounds());
  }

  var baseMaps = {
    "Streets": basemapLayer("Streets"),
    "Topographic": basemapLayer("Topographic")
  };

  var overlayMaps = {
    "TAs": areas,
    "Gates": points
  };

  baseMaps["Streets"].addTo(map);

  L.control.layers(baseMaps, overlayMaps).addTo(map);
  L.control.scale().addTo(map);

  areas.bindPopup(area => {
    return L.Util.template('<p>{F_Area_ID}<br>{F_label}<br>{Use_Restri}<br>More stuff here!</p>', area.feature.properties);
  }).addTo(map);

  points.bindPopup(point => {
    return L.Util.template('<p>Gate {F_Area_ID}<br>{F_label}<br>{Use_Restri}<br>More stuff here!</p>', point.feature.properties);
  }).addTo(map);


  setupEvents(areas, map);

});
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
createSearcher().addTo(map);