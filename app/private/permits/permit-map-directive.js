

define([
    'app',
    'esri/map',
    'esri/geometry/Point',
    'esri/dijit/InfoWindow',
    'esri/InfoTemplate',
    'esri/layers/FeatureLayer',
    'esri/layers/ArcGISTiledMapServiceLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/GraphicsLayer',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/graphic',
    'esri/Color',
    'esri/dijit/BasemapLayer',
    'esri/dijit/BasemapGallery',
    'esri/dijit/Basemap'
    
], function (app, Map, Point, InfoWindow, InfoTemplate, FeatureLayer, ArcGISTiledMapServiceLayer, ArcGISDynamicMapServiceLayer,
            GraphicsLayer, SimpleFillSymbol, SimpleLineSymbol, Query, QueryTask, Graphic, Color) {

    // register a new directive called esriMap with our app
    app.directive('permitMap', function ($rootScope) {
        // this object will tell angular how our directive behaves
        return {
            // only allow esriMap to be used as an element (<esri-map>)
            restrict: 'E',

            scope: false,

            // define how our template is compiled this gets the $element our directive is on as well as its attributes ($attrs)
            compile: function ($element, $attrs) {
                // remove the id attribute from the main element
                $element.removeAttr("id");

                // append a new div inside this element, this is where we will create our map
                $element.append("<div id=" + $attrs.id + "></div>");

                // since we are using compile we need to return our linker function
                // the 'link' function handles how our directive responds to changes in $scope
                return function (scope, element, attrs, controller) {
                    scope.$watch("center", function (newCenter, oldCenter) {
                        if (newCenter !== oldCenter) {
                            controller.centerAt(newCenter);
                        }
                    });
                };
            },

            // even though $scope is shared we can declare a controller for manipulating this directive
            // this is great for when you need to expose an API for manipulaiting your directive
            // this is also the best place to setup our map
            controller: function ($scope, $element, $attrs) {

                //console.dir($attrs);

                // setup our map options based on the attributes and scope
                var mapOptions = {
                    center: ($attrs.center) ? $attrs.center.split(",") : $scope.center,
                    zoom: ($attrs.zoom) ? $attrs.zoom : $scope.zoom,
                    spatialReference: {
                        wkid: 102100 //mercator
                       // wkid:26911 //nad_1983
                        //"wkt":'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]'

                    }
                };

                // declare our map
                console.log("trying to make the map");

                require(["esri/config"], function (esriConfig) {

                    esriConfig.defaults.io.proxyUrl = proxyUrl; // From the config.js file.
                    esriConfig.defaults.io.alwaysUseProxy = true;

                });

                var map = new Map($attrs.id, mapOptions);
                //our first layer from up above...
                //console.log("//restdata.umatilla.nsn.us/arcgis/rest/services/BasemapParcelViewerCTUIR/MapServer?token=" + security_token);

                //setup basemaps
                map.selectedBasemap = defaultLayer; //"imageryLayer" 
                map.selectedServiceLayers = [
                    "parcels", 
                    "parcels_outline"
                ];

                map.basemaps = [];
                for (var property in parcelLayerConfig) {
                    if (parcelLayerConfig.hasOwnProperty(property)) {
                        map.basemaps.push({ label: parcelLayerConfig[property].Display, name: property });
                    }
                };

                map.serviceLayers = [];
                for (var property in servicesLayerConfig) {
                    if (servicesLayerConfig.hasOwnProperty(property)) {
                        map.serviceLayers.push({ label: servicesLayerConfig[property].Display, name: property });
                    }
                };


                //might want to do this: https://developers.arcgis.com/javascript/3/jssamples/query_hover.html 
                // did try but had errors. might not be possible without using featureservice?: https://community.esri.com/thread/191330-popup-on-mouse-over-on-dynamic-service

                map.updateLayers = function () {

                    console.log("Changing Layer: " + map.selectedBasemap);

                    try {
                        console.log("Loading layer: " + parcelLayerConfig[map.selectedBasemap].ServiceURL);

                        map.removeAllLayers();

                        //add the selected basemap
                        var new_layer = new ArcGISTiledMapServiceLayer(parcelLayerConfig[map.selectedBasemap].ServiceURL);
                        map.addLayer(new_layer);
                        map.currentBasemapLayer = new_layer;

                        //now add any selected service layers
                        for (var i = map.selectedServiceLayers.length - 1; i >= 0; i--) {
                            var service_layer;
                            console.log(i);
                            console.log(map.selectedServiceLayers[i]);
                            if ( servicesLayerConfig[map.selectedServiceLayers[i]].ServiceURL.includes("FeatureServer") )
                            {
                                service_layer = new FeatureLayer(servicesLayerConfig[map.selectedServiceLayers[i]].ServiceURL);
                            }
                            else //then it is a MapServer
                            {
                                service_layer = new ArcGISDynamicMapServiceLayer(servicesLayerConfig[map.selectedServiceLayers[i]].ServiceURL);
                            }

                            console.log("adding " + servicesLayerConfig[map.selectedServiceLayers[i]].ServiceURL);
                            map.addLayer(service_layer);
                        };

                        map.parcelLayer = new GraphicsLayer();
                        map.addLayer(map.parcelLayer);

                        console.log("done!");
                        map.reposition();
                    }
                    catch (e) {
                        console.dir(e);
                    }
                };

                map.updateLayers();


                // start exposing an API by setting properties on "this" which is our controller
                // lets expose the "addLayer" method so child directives can add themselves to the map
                this.addLayer = function (layer, filter) {
                    map.locationLayer = map.addLayer(layer);
                    return map.locationLayer;
                };

                

                //use this for doing a search by parcelid or address
                map.querySearchParcel = function (searchParam, callback) {
                    var queryTask = new QueryTask(parcelLayerConfig[map.selectedBasemap].QueryURL);
                    var query = new Query();
                    query.where = dojo.string.substitute(parcelLayerConfig[map.selectedBasemap].ParcelQuery, [searchParam]);
                    console.log("query.where is next...");
                    console.dir(query.where);
                    query.returnGeometry = false;
                    query.outSpatialReference = this.spatialReference;
                    query.outFields = ["*"];

                    queryTask.execute(query, function (result) {
                        callback(result.features); //give back the parcel features we found...
                    }, function (err) {
                        console.log("Failure executing query!");
                        console.dir(err);
                        console.dir(query);
                    });
                };

                //use this for selecting a specific parcel/allotment by id (no geometry)
                map.queryMatchParcel = function (searchParam, callback) {
                    var queryTask = new QueryTask(parcelLayerConfig[map.selectedBasemap].QueryURL);
                    var query = new Query();
                    query.where = dojo.string.substitute(parcelLayerConfig[map.selectedBasemap].LocateParcelQuery, [searchParam]);
                    query.returnGeometry = false;
                    query.outSpatialReference = this.spatialReference;
                    query.outFields = ["*"];

                    queryTask.execute(query, function (result) {
                        callback(result.features); //give back the parcel features we found...
                    }, function (err) {
                        console.log("Failure executing query!");
                        console.dir(err);
                        console.dir(query);
                    });
                };


                //use this to select a particular parcel either by objectid (like after a search) or x,y mapPoint
                map.querySelectParcel = function (mapPoint, objectId, callback) {
                    console.log("Inside leasingMap.js...");
                    console.log("Running query on: " + parcelLayerConfig[map.selectedBasemap].QueryURL);

                    var queryTask = new QueryTask(parcelLayerConfig[map.selectedBasemap].QueryURL);
                    var query = new Query();

                    query.outSpatialReference = this.spatialReference;
                    query.returnGeometry = true;
                    query.outFields = ["*"];
                    if (mapPoint) {
                        query.geometry = mapPoint;
                    }
                    else {
                        query.objectIds = [objectId];
                    }

                    query.spatialRelationship = Query.SPATIAL_REL_INTERSECTS;
                    queryTask.execute(query, function (result) {
                        console.dir(result);
                        callback(result.features); //give back the parcel features we found...
                    }, function (err) {
                        console.log("Failure executing query!");
                        console.dir(err);
                        console.dir(query);
                    });


                };


                map.clearGraphics = function () {
                    this.parcelLayer.clear();
                }

                map.addParcelToMap = function (feature, color, alpha) {

                    var graphic;
                    if (!color)
                        color = "#FF6600";

                    if (!alpha)
                        alpha = .25;


                    var lineColor = new dojo.Color();
                    lineColor.setColor(color);

                    var fillColor = new dojo.Color();
                    fillColor.setColor(color);
                    fillColor.a = alpha;

                    var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
                        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, lineColor, 3), fillColor);

                    graphic = new Graphic(feature.geometry, symbol, feature.attributes);

                    this.parcelLayer.clear();
                    this.parcelLayer.add(graphic);
                    this.selectedFeature = feature;
                    this.selectedGraphic = graphic;

                    $scope.$emit("map.selectedFeature", feature); //notify
                }

                map.centerAndZoomToGraphic = function (graphic, levelOrFactor) {
                    var the_level = (levelOrFactor) ? levelOrFactor : 2;
                    
                    var centerPoint = graphic.geometry.getExtent().getCenter();
                    return map.centerAndZoom(centerPoint, the_level);
                };

                // lets expose a version of centerAt that takes an array of [lng,lat]
                this.centerAt = function (center) {
                    var point = new Point({
                        x: center[0],
                        y: center[1],
                        spatialReference: {
                            wkid: 102100 //mercator
                            //wkid:26911 //nad_1983
                            //"wkt":'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]'
                        }
                    });

                    map.centerAt(point);
                };

                // listen for click events and expost them as broadcasts on the scope and suing the scopes click handler
                map.on("click", function (e) {
                    // emit a message that bubbles up scopes, listen for it on your scope
                    $scope.$emit("map.click", e);

                    // use the scopes click fuction to handle the event
                    $scope.$apply(function ($scope) {
                        $scope.click.call($scope, e);
                    });
                });

                $scope.map = map;

            }
        };
    });
});

