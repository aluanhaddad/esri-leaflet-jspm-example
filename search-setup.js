import { geosearch, arcgisOnlineProvider, featureLayerProvider } from 'esri-leaflet-geocoder';

export default function createSearcher() {

    var searchControl = geosearch({
        providers: [
            featureLayerProvider({
                url: '//services1.arcgis.com/R293DznM2zjfdFQ4/arcgis/rest/services/FAPHManagedPolygons/FeatureServer/0',
                searchFields: ['F_Area_ID', 'F_label'],
                label: 'Search',
                bufferRadius: 250,
                formatSuggestion: function (feature) {

                    if (feature) {
                        return feature.properties.F_Area_ID + ' - ' + feature.properties.F_label;
                    }
                    return '';
                }
            })
        ]
    });
    return searchControl;
}