const infoPane = document.getElementById('info-pane');

export default function setupEvents(areas, map) {

    areas.on('mouseout', area => {

        infoPane.innerHTML = 'Hover to Inspect';
    });

    areas.on('mouseover', function (oldId) {
        return function (area) {
            areas.resetStyle(oldId);
            oldId = area.layer.feature.id;
            infoPane.innerHTML = area.layer.feature.properties.F_label;
            area.layer.bringToFront();
            areas.setFeatureStyle(area.layer.feature.id, {
                color: 'yellow',
                weight: 3,
                opacity: 1
            });
        }
    } ());

    (function (labels) {
        areas.on('createfeature', function (created) {
            var id = created.feature.id;
            var created = areas.getFeature(id);
            var center = created.getBounds().getCenter();
            var label = L.marker(center, {
                icon: L.divIcon({
                    iconSize: null,
                    className: 'label',
                    html: '<div>' + created.feature.properties.F_Area_ID + '</div>'
                })
            }).addTo(map);
            labels[id] = label;
        });

        areas.on('addfeature', function (added) {
            var label = labels[added.feature.id];
            if (label) {
                label.addTo(map);
            }
        });

        areas.on('removefeature', function (remove) {
            var label = labels[remove.feature.id];
            if (label) {
                map.removeLayer(label);
            }
        });
    })({});
}