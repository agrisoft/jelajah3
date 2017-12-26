// Jelajah v3
// 2017. Tejo Damai Santoso
// Agrisoft
// v0.8b

// Init UI

var base_div = "jelajah";
var map_div = "jelajah_map";
var layer = [];
var raw_local_wms;
var raw_out_wms;
var ext_srv;
var basemaps;
var basemap = [];
var front_layers = [];
var list_workspace;
var hasil_cari;
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var info_layer = [];
var layer_source = [];
var layer_index = [];
var layer_count = 0;
var layeritem = 0;
var draw;
var sketch;
var sketchElement;
var helpTooltipElement;
var helpTooltip;
var measureTooltipElement;
var measureTooltip;
var continuePolygonMsg = 'Klik untuk mulai menggambar area';
var continueLineMsg = 'Klik untuk mulai menggambar garis';
var listener;

// Functions
function getSimpulInfo() {
    $.ajax({
        url: palapa_api_url + "sisteminfo",
        async: false,
        success: function(data) {
            window.map_extent = [parseFloat(data.extent[0]), parseFloat(data.extent[1]), parseFloat(data.extent[2]), parseFloat(data.extent[3])]
        }
    })
}

getSimpulInfo()

function randomNumber() {
    return Math.floor((Math.random() * 10000) + 1);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function uniqueArray(arr) {
    var a = [];
    for (var i = 0, l = arr.length; i < l; i++)
        if (a.indexOf(arr[i]) === -1 && arr[i] !== '')
            a.push(arr[i]);
    return a;
}


function extToMerc(extent) {
    return ol.proj.transformExtent(extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'))
}

function olAddWMSLayer(serviceUrl, layername, layermark, min_x, min_y, max_x, max_y, layer_nativename) {
    // rndlayerid = randomNumber()
    window.layer_count = layer_count + 1;
    rndlayerid = layer_count;
    layer_source[rndlayerid] = new ol.source.TileWMS({
        url: serviceUrl,
        params: { LAYERS: layername, TILED: true, SRS: 'EPSG:3857' },
        crossOrigin: 'anonymous'
    })
    layer[rndlayerid] = new ol.layer.Tile({
        title: layermark,
        tipe: 'WMS',
        visible: true,
        preload: Infinity,
        extent: extToMerc([min_x, min_y, max_x, max_y]),
        source: layer_source[rndlayerid]
    });
    map.addLayer(layer[rndlayerid]);
    console.log(rndlayerid, layermark, layer[rndlayerid].get('title'))
    setTimeout(() => {
        listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style='        padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
        $('#sortableul').append(listappend);
        info_layer.push(rndlayerid);
        extent = layer[rndlayerid].getExtent();
        map.getView().fit(extent, map.getSize());
        legend_url = serviceUrl + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=fontAntiAliasing:true&LAYER=' + layer_nativename;
        legend_html = "<img src='" + legend_url + "'>";
        $('#wmslegend_' + rndlayerid).append(legend_html);
        layer_index.push(rndlayerid);
        layer[rndlayerid].setZIndex(layer.length);
    }, 1000);
}

function olAddDEFLayer(layername, layermark, layer_nativename, aktif, min_x, min_y, max_x, max_y) {
    setTimeout(() => {
        console.log(layername, layermark, layer_nativename, aktif, min_x, min_y, max_x, max_y)
            // rndlayerid = randomNumber()
        window.layer_count = layer_count + 1;
        rndlayerid = layer_count;
        layer_source[rndlayerid] = new ol.source.TileWMS({
            url: local_gs,
            params: { LAYERS: layername, TILED: true, SRS: 'EPSG:3857' },
            crossOrigin: 'anonymous'
        })
        layer[rndlayerid] = new ol.layer.Tile({
            title: layermark,
            tipe: 'WMS',
            visible: true,
            preload: Infinity,
            extent: extToMerc([min_x, min_y, max_x, max_y]),
            source: layer_source[rndlayerid]
        });
        map.addLayer(layer[rndlayerid]);
        console.log(rndlayerid, layermark, layer[rndlayerid].get('title'))
        if (aktif) {
            listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style='        padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
            $('#sortableul').append(listappend);
        } else {
            listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box_outline_blank</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style='        padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
            $('#sortableul').append(listappend);
            layer[rndlayerid].setVisible(false);
        }
        info_layer.push(rndlayerid);
        legend_url = local_gs + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=fontAntiAliasing:true&LAYER=' + layer_nativename;
        legend_html = "<img src='" + legend_url + "'>";
        $('#wmslegend_' + rndlayerid).append(legend_html);
        layer_index.push(rndlayerid);
        layer[rndlayerid].setZIndex(layer.length);
    }, 1000);
}

function olAddRESTLayer(serviceUrl, id) {
    projection = ol.proj.get('EPSG:4326');
    console.log(serviceUrl, id)
    window.layer_count = layer_count + 1;
    rndlayerid = layer_count;
    // layer_source[rndlayerid] = new ol.source.XYZ({
    //     projection: projection,
    //     url: serviceUrl + '/' + id + '/tile/{z}/{y}/{x}'
    // })
    layer_source[rndlayerid] = new ol.source.TileArcGISRest({
        // projection: projection,
        url: serviceUrl,
        crossOrigin: 'anonymous'
    })
    layer[rndlayerid] = new ol.layer.Tile({
        title: id,
        tipe: 'REST',
        visible: true,
        preload: Infinity,
        // extent: extToMerc([min_x, min_y, max_x, max_y]),
        source: layer_source[rndlayerid]
    });
    map.addLayer(layer[rndlayerid]);
    setTimeout(() => {
        listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style='        padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
        $('#sortableul').append(listappend);
        info_layer.push(rndlayerid);
        extent = layer[rndlayerid].getExtent();
        map.getView().fit(extent, map.getSize());
        legend_url = serviceUrl + '?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&legend_options=fontAntiAliasing:true&LAYER=' + layer_nativename;
        legend_html = "<img src='" + legend_url + "'>";
        $('#wmslegend_' + rndlayerid).append(legend_html);
        layer_index.push(rndlayerid);
        layer[rndlayerid].setZIndex(layer.length);
    }, 1000);
}

function layerVis(layerid) {
    if (layer[layerid].getVisible() == true) {
        layer[layerid].setVisible(false);
    } else {
        layer[layerid].setVisible(true);
    }
};

function layerRm(layerid) {
    map.removeLayer(layer[layerid]);
    $("#" + layerid + "").remove();
};

function layerZm(layerid) {
    if (layer[layerid].type == 'TILE') {
        layer_extent = layer[layerid].getExtent();
        map.getView().fit(layer_extent, map.getSize());
    }
    if (layer[layerid].type == 'VECTOR') {
        layer_extent = layer[layerid].getSource().getExtent();
        map.getView().fit(layer_extent, map.getSize());
    }
};

function layerOpa(layerid, opacity) {
    opafrac = opacity / 100;
    layer[layerid].setOpacity(opafrac);
};

function handleFileSelect(evt) {
    console.log(evt)
        // var files = evt.target.files; // FileList object
    console.log('A');
    f = evt;
    // for (var i = 0, f; f = files[i]; i++) {
    console.log(escape(f.name), f.type, f.size);
    // if (uploadedfile == f.name) {
    //     console.log("Sudah diupload!");
    // } else {
    rndlayerid = String(randomNumber());
    is_zip = /(\.zip|\.ZIP)$/i;
    is_gpx = /(\.gpx|\.GPX)$/i;
    is_csv = /(\.csv|\.CSV)$/i;
    if (is_zip.exec(f.name)) {
        console.log('ZIP');
        loadShpZip(f, rndlayerid);
    } else if (is_gpx.exec(f.name)) {
        console.log('GPX');
        loadGpx(f, rndlayerid);
    } else if (is_csv.exec(f.name)) {
        // $("#csv_dialog").dialog("open");
        event.preventDefault();
        loadCSV(f, rndlayerid);
        console.log('CSV');
    } else {
        alert('Type berkas tidak didukung!');
    }
    // }
    // }
    console.log("BLOCKER: ", rndlayerid);
    console.log(layer);
    $('#files').val('');
    // console.log(layer[rndlayerid]);
}


var vector_style = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(170, 34, 34, 0.3)'
    }),
    stroke: new ol.style.Stroke({
        color: '#F22',
        width: 1
    }),
    text: new ol.style.Text({
        font: '12px Calibri,sans-serif',
        fill: new ol.style.Fill({
            color: '#000'
        }),
        stroke: new ol.style.Stroke({
            color: '#fff',
            width: 3
        })
    }),
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: 'rgba(170, 34, 34, 0.3)' }),
        stroke: new ol.style.Stroke({ color: '#F22', width: 1 })
    })
});

function loadShpZip(files, rndid) {
    // var epsg = ($('#epsg').val() == '') ? 4326 : $('#epsg').val(),
    // encoding = ($('#encoding').val() == '') ? 'UTF-8' : $('#encoding').val();
    // console.log(files.name);
    //   if(files.name.split('.')[1] == 'zip') {
    // if(file) $('.dimmer').addClass('active');
    window.layer_count = layer_count + 1;
    rndlayerid = layer_count;
    loadshp({
        url: files,
        encoding: 'UTF-8',
        EPSG: 4326
    }, function(data) {
        URL = window.URL || window.webkitURL || window.mozURL || window.msURL,
            url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));

        feature = new ol.format.GeoJSON().readFeatures(data, {
            featureProjection: 'EPSG:3857'
        });

        // layeritem = layeritem + 1;
        layeritem = rndlayerid;
        layer[layeritem] = new ol.layer.Vector({
            title: String(files.name),
            tipe: 'SHP',
            source: new ol.source.Vector({
                features: feature,
                style: vector_style,
                params: {
                    'LAYERS': 'Shapefile: ' + String(files.name)
                }
            })
        });
        setTimeout(function() {
            console.log(layeritem);
            map.addLayer(layer[layeritem]);
            extent = layer[layeritem].getSource().getExtent();
            map.getView().fit(extent, map.getSize());
            layer_index.push(rndlayerid);
            layer[rndlayerid].setZIndex(layer.length);
            layer[rndlayerid].setStyle(vector_style);
            listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style=' padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
            $('#sortableul').append(listappend);
        }, 2000);
        //   delete layer;
    });
    console.log('C');
    console.log(layer);
    // map.addControl(layerSwitcher);
    console.log('B');

    //   } else {
    // $('.modal').modal('show');
    //   }
}

function loadGpx(files, rndid) {
    window.layer_count = layer_count + 1;
    rndlayerid = layer_count;
    layeritem = rndlayerid;
    gpxformat = new ol.format.GPX();
    gpxreader = new FileReader();
    gpxreader.readAsText(files, "UTF-8");
    gpxreader.onload = function(e) {
        gpxreaderresult = gpxreader.result;
        gpxfeatures = gpxformat.readFeatures(gpxreaderresult, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        }); // console.log(gpxreaderresult);    
        layer[rndlayerid] = new ol.layer.Vector({
            tipe: 'GPX',
            source: new ol.source.Vector({
                features: gpxfeatures,
                params: {
                    'LAYERS': 'GPX: ' + String(files.name)
                }

            })
        });
        setTimeout(function() {
            console.log(rndlayerid);
            map.addLayer(layer[rndlayerid]);
            extent = layer[rndlayerid].getSource().getExtent();
            map.getView().fit(extent, map.getSize());
            layer_index.push(rndlayerid);
            layer[rndlayerid].setZIndex(layer.length);
            layer[rndlayerid].setStyle(vector_style)
            listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style=' padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
            $('#sortableul').append(listappend);
        }, 2000);
    };

}

function loadCSV(files, rndid) {
    window.layer_count = layer_count + 1;
    rndlayerid = layer_count;
    layeritem = rndlayerid;
    csvreader = new FileReader();
    csvreader.readAsText(files, "UTF-8");
    csvreader.onload = function(e) {
        csvreaderresult = csvreader.result;
        console.log(csvreaderresult);
        lines = csvreaderresult.split("\r");
        console.log(lines);
        for (var count = 0; count < lines.length; count++) {
            rowContent = lines[count].split(",");
            for (var i = 0; i < rowContent.length; i++) {
                if (count == 0) {
                    console.log(rowContent[i])
                    $('#csv_select_x').append($("<option></option>").attr("value", rowContent[i]).text(rowContent[i]));
                    $('#csv_select_y').append($("<option></option>").attr("value", rowContent[i]).text(rowContent[i]));
                } else {
                    // console.log(rowContent[i])
                }
            } //end rowContent for loop
        }
        csvasgeojson = csv2geojson.csv2geojson(csvreaderresult, {
            latfield: 'Y',
            lonfield: 'X'
        }, function(err, data) {
            console.log(data);
            feature = new ol.format.GeoJSON().readFeatures(data, {
                featureProjection: 'EPSG:3857'
            });
            layeritem = rndid;
            layer[layeritem] = new ol.layer.Vector({
                title: String(files.name),
                tipe: 'CSV',
                source: new ol.source.Vector({
                    features: feature,
                    params: {
                        'LAYERS': 'CSV: ' + String(files.name)
                    }
                })
            });
            setTimeout(function() {
                console.log(layeritem);
                map.addLayer(layer[layeritem]);
                extent = layer[layeritem].getSource().getExtent();
                map.getView().fit(extent, map.getSize());
                listappend = "<li id='" + rndlayerid + "'><div class='collapsible-header'><div class='layer_control'><i id='visibility' class='material-icons'>check_box</i>" + layer[rndlayerid].get('title') + "</div><!--<i id='getinfo' class='material-icons right'>comment</i>--><i id='zextent' class='material-icons right'>loupe</i><i id='remove' class='material-icons right'>cancel</i></div></div><div class='collapsible-body'><div class='row opa'><span class='col s4'><i class='material-icons' style=' padding-right: 15px; position: relative; bottom: -6px;'>opacity</i>Opacity</span><div class='col s8 range-field'><input type='range' id='opacity' min='0' max='100' value='100'/></div></div><span id='wmslegend_" + rndlayerid + "'></span></div></li>";
                $('#sortableul').append(listappend);
            }, 2000);
        });
    }
}

function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'olm_tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'olm_tooltip olm_tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

function addInteraction() {
    typeSelect = $('#select_ukur').val();
    var type = (typeSelect == '2' ? 'Polygon' : 'LineString');
    draw = new ol.interaction.Draw({
        source: draw_source,
        type: /** @type {ol.geom.GeometryType} */
            (type),
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });
    map.addInteraction(draw);

    createMeasureTooltip();
    createHelpTooltip();

    var listener;
    draw.on('drawstart',
        function(evt) {
            // set sketch
            sketch = evt.feature;

            /** @type {ol.Coordinate|undefined} */
            var tooltipCoord = evt.coordinate;

            listener = sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(geom);
                    tooltipCoord = geom.getLastCoordinate();
                }
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            });
        }, this);

    draw.on('drawend',
        function() {
            measureTooltipElement.className = 'olm_tooltip olm_tooltip-static';
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip();
            ol.Observable.unByKey(listener);
        }, this);

}


/**
 * format length output
 * @param {ol.geom.LineString} line
 * @return {string}
 */
var formatLength = function(line) {
    var length = ol.Sphere.getLength(line);
    var output;
    if ($("#satuan_panjang").val() == '1') {
        output = (Math.round(length * 100) / 100) +
            ' ' + 'm';
    }
    if ($("#satuan_panjang").val() == '2') {
        output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';
    }
    if ($("#satuan_panjang").val() == '3') {
        output = (Math.round(length / 1000 * 100) / 100) * 0.621371 +
            ' ' + 'mil';
    }
    // if (length > 100) {
    //     output = (Math.round(length / 1000 * 100) / 100) +
    //         ' ' + 'km';
    // } else {
    //     output = (Math.round(length * 100) / 100) +
    //         ' ' + 'm';
    // }
    return output;
};


/**
 * Format area output.
 * @param {ol.geom.Polygon} polygon The polygon.
 * @return {string} Formatted area.
 */
var formatArea = function(polygon) {
    var area = ol.Sphere.getArea(polygon);
    var output;
    if ($("#satuan_luas").val() == '4') {
        output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
    }
    if ($("#satuan_luas").val() == '5') {
        output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
    }
    if ($("#satuan_luas").val() == '6') {
        output = (Math.round(area / 1000000 * 100) / 100) * 0.386102 +
            ' ' + 'mil<sup>2</sup>';
    }
    // if (area > 10000) {
    //     output = (Math.round(area / 1000000 * 100) / 100) +
    //         ' ' + 'km<sup>2</sup>';
    // } else {
    //     output = (Math.round(area * 100) / 100) +
    //         ' ' + 'm<sup>2</sup>';
    // }
    return output;
};

function switchbaselayer(basetitle) {
    setTimeout(() => {
        for (i = 0; i < default_layers.length; i++) {
            if (basetitle == default_layers[i].get('title')) {
                isit = true;
                default_layers[i].setVisible(true);
            } else {
                isit = false;
                default_layers[i].setVisible(false);
            }
            console.log(basetitle, default_layers[i].get('title'), isit)
        }
    }, 500);
}

// Custom control

// Init map

// var layers = [];

var layer_osm = new ol.layer.Tile({
    title: 'OSM',
    visible: true,
    preload: Infinity,
    source: new ol.source.OSM(),
    zIndex: -10
});

var layer_rbi = new ol.layer.Tile({
    title: 'RBI',
    visible: false,
    preload: Infinity,
    source: new ol.source.XYZ({
        url: 'http://portal.ina-sdi.or.id/arcgis/rest/services/IGD/RupabumiIndonesia/MapServer/tile/{z}/{y}/{x}'
    }),
    zIndex: -10
});

var layer_esri = new ol.layer.Tile({
    title: 'ESRI',
    visible: false,
    preload: Infinity,
    source: new ol.source.XYZ({
        url: 'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }),
    zIndex: -10
});

var layer_rbibaru = new ol.layer.Tile({
    title: 'RBI OS',
    visible: false,
    preload: Infinity,
    source: new ol.source.TileWMS({
        url: 'http://202.4.179.123:8080/geoserver/gwc/service/wms',
        params: { LAYERS: 'basemap_rbi:basemap', VERSION: '1.1.1' }
    }),
    zIndex: -10
});

var overlay = new ol.Overlay({
    title: 'Overlay',
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

var draw_source = new ol.source.Vector();
var draw_vector = new ol.layer.Vector({
    source: draw_source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    }),
    zIndex: 666666
});

var default_layers = [layer_osm, layer_rbi, layer_esri, layer_rbibaru, draw_vector];

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

var scline = new ol.control.ScaleLine({
    units: 'metric',
    minWidth: 100
});

merc_extent = ol.proj.transformExtent(map_extent, ol.proj.get('EPSG:4326'), ol.proj.get('EPSG:3857'))

// Init MAP

var map = new ol.Map({
    layers: default_layers,
    target: map_div,
    overlays: [overlay],
    view: new ol.View({
        // projection: 'EPSG:4326',
        // center: [116.5, -4],
        extent: merc_extent,
        zoom: 5,
        minZoom: 4,
        maxZoom: 22
    }),
    controls: ol.control.defaults().extend([scline])
});

map.getView().fit(merc_extent, map.getSize());

// Init UI Controls

var basemapbox = "<div class='basemapbox'><span class='basemap'></span><span class='photos'></span></div>";
var basemapmodal = "<div class='basemapmodal'></div>";
var photosmodal = "<div class='photosmodal'></div>";
var cari_geocoding = "<div class='cari_geocoding'></div>";
var cari_geocoding_input = "<input id='cari_geocoding_input' type='text' class='validate cari_geocoding_input'>";
var cari_geocoding_submit = "<i class='material-icons cari_geocoding_submit'>search</i><i class='material-icons cari_geocoding_tutup'>close</i>";
var hasil_cari_geocoding = "<div class='row geocoding_wrap'><div id='hasil_cari_geocoding' class='col s12 grey'></div>"
var leftsidebarburger = "<i class='material-icons leftsidebarburger'>menu</i>"
var leftsidebar = "<div class='leftsidebar'></div>";
var layerwindow = "<div id='layerwindow'><div id='layerwindowheader'>Tambah Layer</div><div id='layerwindowcontent'><ul id='addlayerstab' class='tabs'><li class='tab col s3'><a class='active' href='#locallayer'>Dataset</a></li><li class='tab col s3'><a href='#simpul'>Simpul</a></li><li class='tab col s3'><a href='#localfiles'>File</a></li><li class='tab col s3'><a href='#extlayer'>URL</a></li></ul><div id='tabsubheader'></div><div id='locallayer' class='col s12 grey lighten-4 addlayercontentpad'></div><div id='extlayer' class='col s12 red addlayercontentpad'>Test 2</div><div id='localfiles' class='col s12 grey lighten-4 addlayercontentpad'><div id='dropzone'></div></div><div id='simpul' class='col s12 yellow addlayercontentpad'><div class='col s2' id='ext_srv_t'></div><div class='col s12'> <ul id='ext_wms_item_list' class='collection'></ul></div></div></div></div>";
var layerwindow_lokal = "<ul class='collapsible' data-collapsible='expandable' id='layerwindow_lokal'></ul>";
var tablayerlokal = "<div class='input-field col s12 textinputnolab'><input placeholder='Cari layer ...' id='layername_lokal' type='text' class='validate tabsub' style='margin:0px;'/></div>";
var tablayersimpul = "<div class='input-field col s12 textinputnolab'><select id='ext_srv_type'><option disable='' selected='selected' value='WMS'>Pilih Servis</option></select></div>";
var tablayerurl = "<div class='input-field col s12 textinputnolab'><input placeholder='Cari layer ...' id='layername_url' type='text' class='validate tabsub' style='margin:0px;'/></div>";

$("#jelajah").append(basemapbox);
$("#jelajah").append(basemapmodal);
$("#jelajah").append(photosmodal);
$("#jelajah").append(cari_geocoding);
$(".cari_geocoding").append(leftsidebarburger);
$(".cari_geocoding").append(cari_geocoding_input);
$(".cari_geocoding").append(cari_geocoding_submit);
$("#jelajah").append(leftsidebar);
$("#jelajah").append(layerwindow);
$("#locallayer").append(layerwindow_lokal);
$("#tabsubheader").append(tablayerlokal);
$("#dropzone").append("<div id='dropinfo'>Klik di sini, atau Taruh berkas ZIP (Shapefile), GPX, atau CSV.</div>");

// UI Function

var basemapmodal_stat = false;
var photosmodal_stat = false;
var leftsidebar_stat = false;

$(function() {
    var dropzone = new Dropzone("#dropzone", {
        url: palapa_api_url + "fakepath",
        acceptedFiles: '.zip,.ZIP,.gpx,.GPX,.csv,.CSV'
    });
    dropzone.on("success", function(file) {
        handleFileSelect(file);
        Materialize.toast('Berkas terupload!', 3000, 'rounded');
        console.log('ADDED FILE')
    });
    dropzone.on("error", function(file) {
        Materialize.toast('Berkas Tidak Sesuai!', 3000, 'rounded');
        console.log('ERROR')
    });
})

function layertabswitch(tab) {
    if (tab == 'Dataset') {
        $("#tabsubheader").empty()
        $("#tabsubheader").append(tablayerlokal)
    }
    if (tab == 'Simpul') {
        $("#tabsubheader").empty()
        $("#tabsubheader").append(tablayersimpul)
        for (i = 0; i < ext_srv.length; i++) {
            if (ext_srv[i].type == 'OGC WMS') { tipe = 'WMS' } else { tipe = 'ESRI' };
            item_html = "<option value='" + ext_srv[i].url + "'>" + ext_srv[i].name + "</option>";
            $('#ext_srv_type').append(item_html);
            extChanged();
        }
        $('select').material_select();
    }
    if (tab == 'URL') {

        $("#tabsubheader").empty()
        $("#tabsubheader").append(tablayerurl)
    }
    if (tab == 'File') {

        $("#tabsubheader").empty()
    }
}

function basemapstoggle() {
    if (!basemapmodal_stat) {
        $(".ol-zoom").css('bottom', '9.5em');
        $(".basemapbox").css('bottom', '100px');
        $(".basemapmodal").css('height', '100px');
        basemapmodal_stat = true;
    } else {
        $(".ol-zoom").css('bottom', '5em');
        $(".basemapbox").css('bottom', '35px')
        $(".basemapmodal").css('height', '0px');
        basemapmodal_stat = false;
    }
}

function photostoggle() {
    if (!photosmodal_stat) {
        $(".ol-zoom").css('bottom', '9.5em');
        $(".basemapbox").css('bottom', '100px');
        $(".photosmodal").css('height', '100px');
        photosmodal_stat = true;
    } else {
        $(".ol-zoom").css('bottom', '5em');
        $(".basemapbox").css('bottom', '35px')
        $(".photosmodal").css('height', '0px');
        photosmodal_stat = false;
    }
}

function leftsidebartoggle() {
    if (!leftsidebar_stat) {
        $(".cari_geocoding").css('left', '325px');
        $(".leftsidebar").css('width', '300px');
        $(".geocoding_wrap").css('left', '300px')
        $("i cari_geocoding_tutup").css('display', 'unset')
        leftsidebar_stat = true;
    } else {
        $(".cari_geocoding").css('left', '25px');
        $(".leftsidebar").css('width', '0px');
        $(".geocoding_wrap").css('left', '0px')
        $("i cari_geocoding_tutup").css('display', 'none')
        leftsidebar_stat = false;
    }
}

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

$(".basemap").on('click', function() {
    basemapstoggle();
})

$(".photos").on('click', function() {
    photostoggle();
})

$(".leftsidebarburger").on('click', function() {
    leftsidebartoggle();
})

$("#addlayerstab a").on('click', function(e) {
    seltab = $(e.target).text();
    layertabswitch(seltab)
})

$(".cari_geocoding_submit").on('click', function() {
    $("#hasil_cari_geocoding").remove();
    $("#jelajah").append(hasil_cari_geocoding);
})

$('#ext_wms_item_list').on('click', function(e) {
    p_id = $(e.target).attr('id');
    srv_type = $('#ext_srv_t').text();
    srv_url = $('#url_ext_srv').text();
    if (srv_type == 'OGC WMS') { tipe = 'WMS' } else { tipe = 'ESRI' };
    if (tipe == 'WMS') {
        if (p_id == '' || typeof(p_id) == 'undefined' || p_id == 'add_check') {
            p_id = $(e.target).closest('li').attr('id');
        }
        var min_x, min_y, max_x, max_y, layer_nativename;
        for (i = 0; i < raw_out_wms.length; i++) {
            // console.log(raw_local_wms[i].layer_nativename)
            if (raw_out_wms[i].Name.indexOf(p_id) >= 0) {
                min_x = raw_out_wms[i].EX_GeographicBoundingBox[0];
                min_y = raw_out_wms[i].EX_GeographicBoundingBox[1];
                max_x = raw_out_wms[i].EX_GeographicBoundingBox[2];
                max_y = raw_out_wms[i].EX_GeographicBoundingBox[3];
                layer_nativename = raw_out_wms[i].Name;
            }
        }
        p_name = $(e.target).find('.layermark').first().text();
        if (p_name == '' || typeof(p_name) == 'undefined') {
            p_name = $(e.target).closest('.layermark').first().text();
            if (p_name == '' || typeof(p_name) == 'undefined') {
                p_name = $(e.target).siblings('.layermark').first().text();
            }
        }
        p_state = $(e.target).find('#add_check').first().text();
        if (p_state == '' || typeof(p_state) == 'undefined') {
            p_state = $(e.target).siblings('#add_check').first().text();
            if (p_state == '' || typeof(p_state) == 'undefined') {
                p_state = $(e.target).text();
            }
        }
        console.log(p_state, p_id, p_name, min_x, min_y, max_x, max_y, layer_nativename);
        olAddWMSLayer(srv_url, p_id, p_name, min_x, min_y, max_x, max_y, layer_nativename);
    } else {
        olAddRESTLayer(srv_url, p_id);
    }
})

dragElement(document.getElementById(("layerwindow")));

function extChanged() {
    $("#ext_srv_type").on('change', function() {
        console.log('CHANGED');
        tipe = 'WMS';
        $("#url_ext_srv").text($("#ext_srv_type").val())
        $('#ext_wms_item_list').empty();
        for (i = 0; i < ext_srv.length; i++) {
            if (ext_srv[i].url == $("#ext_srv_type").val()) {
                if (ext_srv[i].type == 'OGC WMS') { tipe = 'WMS' } else { tipe = 'ESRI' };
                $("#ext_srv_t").text(ext_srv[i].type);
                if (tipe == 'WMS') {
                    function getWMSdata() {
                        wmscapurl = ext_srv[i].url + '?service=wms&request=GetCapabilities';
                        $.ajax({
                            url: _proxy + encodeURIComponent(wmscapurl),
                            async: false,
                            success: function(wmscapobj) {
                                wmscap = new WMSCapabilities().parse(wmscapobj);
                                wmslayerlist = wmscap.Capability.Layer.Layer;
                                window.raw_out_wms = wmslayerlist;
                                console.log(wmslayerlist)
                                $('#wms_item_list').empty();
                                for (i = 0; i < wmslayerlist.length; i++) {
                                    item_html = "<li id='" + wmslayerlist[i].Name + "' class='collection-item'><i id='add_check' class='material-icons'>add_circle</i> <span class='layermark' id='" + wmslayerlist[i].Name + "'>" + wmslayerlist[i].Title + "</span></li>";
                                    $('#ext_wms_item_list').append(item_html);
                                }
                            }
                        })
                    }
                    getWMSdata()
                } else {
                    esricapurl = ext_srv[i].url + '?f=pjson';
                    var esricapobj;
                    $.ajax({
                            url: esricapurl,
                            async: false,
                            success: function(data) {
                                layers = JSON.parse(data).layers;
                                for (i = 0; i < layers.length; i++) {
                                    item_html = "<li id='" + layers[i].id + "' class='collection-item'><i id='add_check' class='material-icons'>add_circle</i> <span class='layermark' id='" + layers[i].id + "'>" + layers[i].name + "</span></li>";
                                    $('#ext_wms_item_list').append(item_html);
                                }
                            }
                        })
                        // $.get(esricapurl, function(data) {
                        //     console.log(JSON.parse(data));
                        //     layers = JSON.parse(data).layers;
                        //     for (i = 0; i < layers.length; i++) {
                        //         item_html = "<li id='" + layers[i].id + "' class='collection-item'><i id='add_check' class='material-icons'>add_circle</i> <span class='layermark' id='" + layers[i].id + "'>" + layers[i].name + "</span></li>";
                        //         $('#ext_wms_item_list').append(item_html);
                        //     }
                        // });
                        // esricapjson = JSON.parse(esricapobj.responseText);
                        // console.log(esricapobj);
                }
            }
        }
    })
}

$("#layername_lokal").on('input', function() {
    $('#layerwindow_lokal').empty();
    console.log($("#layername_lokal").val())
    carilayer = $("#layername_lokal").val();
    listw = [];
    for (j = 0; j < raw_local_wms.length; j++) {
        listw.push(raw_local_wms[j].workspace);
    }
    list_workspace = uniqueArray(listw);
    for (k = 0; k < list_workspace.length; k++) {
        w_html = "<li id='wrk_" + list_workspace[k] + "'><div class='collapsible-header active'><i class='material-icons tiny'>collections</i>" + list_workspace[k] + "</div><div class='collapsible-body'><ul id='id_" + list_workspace[k] + "' class='collection'></ul></div></li>";
        $('#layerwindow_lokal').append(w_html);
        items = 0;
        for (u = 0; u < raw_local_wms.length; u++) {
            if (raw_local_wms[u].layer_name.toLowerCase().indexOf(carilayer) >= 0) {
                if (raw_local_wms[u].workspace == list_workspace[k] && raw_local_wms[u].layer_advertised == true) {
                    l_html = "<li id='" + raw_local_wms[u].layer_nativename + "' class='collection-item'><i id='" + raw_local_wms[u].layer_nativename + "' class='material-icons'>add_circle</i> <span class='layermark' id='" + raw_local_wms[u].layer_nativename + "'>" + raw_local_wms[u].layer_name + "</span></li>";
                    $('#id_' + list_workspace[k]).append(l_html);
                    items = items + 1;
                }
            }
        }
        if (items == 0) {
            $('#wrk_' + list_workspace[k]).remove();
        }
    }
    if ($("#layername_lokal").val() == '') {
        $('#layerwindow_lokal').empty();
        getLocalLayers();
    }
})

$("#layerwindow_lokal").on('click', function(e) {
    p_id = $(e.target).attr('id');
    if ($(e.target).find('.layermark').first().text()) {
        p_name = $(e.target).find('.layermark').first().text();
    } else {
        p_name = $(e.target).siblings('.layermark').first().text();
    }
    console.log(p_id);
    var min_x, min_y, max_x, max_y, layer_nativename;
    for (i = 0; i < raw_local_wms.length; i++) {
        if (raw_local_wms[i].layer_nativename.indexOf(p_id) >= 0) {
            min_x = raw_local_wms[i].layer_minx;
            min_y = raw_local_wms[i].layer_miny;
            max_x = raw_local_wms[i].layer_maxx;
            max_y = raw_local_wms[i].layer_maxy;
            layer_nativename = raw_local_wms[i].layer_nativename;
        }
    }
    console.log(p_name, min_x, min_y, max_x, max_y, layer_nativename);
    olAddWMSLayer(local_gs, p_id, p_name, min_x, min_y, max_x, max_y, layer_nativename);
})

// Get Initial Data

function getLocalLayers() {
    $.ajax({
        url: palapa_api_url + "getWMSlayers",
        async: false,
        success: function(data) {
            window.raw_local_wms = data;
            listw = [];
            for (j = 0; j < data.length; j++) {
                listw.push(data[j].workspace);
            }
            list_workspace = uniqueArray(listw);
            for (k = 0; k < list_workspace.length; k++) {
                w_html = "<li id='wrk_" + list_workspace[k] + "'><div class='collapsible-header'><i class='material-icons tiny'>collections</i>" + list_workspace[k] + "</div><div class='collapsible-body'><ul id='id_" + list_workspace[k] + "' class='collection'></ul></div></li>";
                $('#layerwindow_lokal').append(w_html);
                items = 0;
                for (u = 0; u < data.length; u++) {
                    if (data[u].workspace == list_workspace[k] && data[u].layer_advertised == true) {
                        l_html = "<li id='" + data[u].layer_nativename + "' class='collection-item'><i id='" + raw_local_wms[u].layer_nativename + "' class='material-icons'>add_circle</i> <span class='layermark' id='" + data[u].layer_nativename + "'>" + data[u].layer_name + "</span></li>";
                        $('#id_' + list_workspace[k]).append(l_html);
                        items = items + 1;
                    }
                }
                if (items == 0) {
                    $('#wrk_' + list_workspace[k]).remove();
                }
            }
        }
    })
}
getLocalLayers();

function getExtService() {
    $.ajax({
        url: palapa_api_url + "extsrv/list",
        async: false,
        success: function(data) {
            window.ext_srv = JSON.parse(data);
            tipe = 'WMS';
            for (i = 0; i < ext_srv.length; i++) {
                if (ext_srv[i].type == 'OGC WMS') { tipe = 'WMS' } else { tipe = 'ESRI' };
                item_html = "<option value='" + ext_srv[i].url + "'>" + ext_srv[i].name + "</option>";
                $('#ext_srv_type').append(item_html);
            }
        }
    })
}
getExtService();


// DOC READY

$(document).ready(function() {
    $('select').material_select();



});