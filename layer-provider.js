import $ from 'jquery';

export async function getFeatureServiceLayers(portalSyskey) {
    const data = await $.ajax('//services1.arcgis.com/R293DznM2zjfdFQ4/ArcGIS/rest/services?f=json');
    var services = JSON.parse(data).services;

    return services
        .filter(s => {
            const key = s.name.split('_')[0];
            return key && parseInt(key.substring(6), 10) === portalSyskey;
        }).map(x => x.url.substring(5));


}


// function processLayers() {

//   getFeatureServiceLayers(portalSyskey).then(featureServiceLayers => {
//     featureServiceLayers.forEach(layer => {
//       featureLayer({
//         url: layer,
//         style: function (feature) {
//           return {
//             weight: 2,
//           };
//         }
//       }).addTo(map);
//     });
//   });
// }

// processLayers();
