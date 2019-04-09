// defines cross-module functions, components and services that we can use in anywhere

//I wish you could just specify a directory and it would find the files and load them, but
// requirejs doesn't work that way so we have to reference each one by hand. -kb
require([

    //loads a variety of common functions
    'core/common/common-functions',

    //loads services used by other modules
    'core/common/services/common-service',
    'core/common/services/logger',
    'core/common/services/service-utilities',
    'core/common/services/wish',

    //loads the common controllers
    'core/common/components/modals/modal-quick-add-accuracycheck',
    'core/common/components/modals/modal-quick-add-characteristic',
    'core/common/components/modals/modal-add-location',
    'core/common/components/modals/modal-create-instrument',
    'core/common/components/modals/modal-bulk-rowqa-change',
    'core/common/components/modals/modal-save-success',
    'core/common/components/modals/modal-create-fisherman',
    'core/common/components/modals/modal-link-field',
    'core/common/components/modals/modal-verify-action',
    'core/common/components/modals/modal-invalid-operation',

    //'core/common/components/file/modal-file-add',
    //'core/common/components/file/modal-file-delete',
    'core/common/components/file/modal-files',
    'core/common/components/file/modal-exportfile',
    'core/common/components/file/modal-waypoint-file',
    'core/common/components/grid/cell-editors',
    'core/common/components/grid/cell-validation',
    'core/common/components/grid/cell-control-types',
    'core/common/components/grid/grid-service',
    
    //load other common directives
    'core/common/directives/checklists',
    'core/common/directives/feature-layer',
    'core/common/directives/map',
    'core/common/directives/field-definitions',
    'core/common/directives/roles',
    'core/common/directives/validation',
    'core/common/directives/currency', // ui-currency attribute for the magic



], function () {
    //add the controllers and services to the module once the files are loaded!

    //controllers 
    common_module.controller('ModalQuickAddAccuracyCheckCtrl', modal_quick_add_accuracycheck);
    //common_module.controller('ModalQuickAddCharacteristicCtrl', modal_quick_add_characteristic); //kb 11/1 - this is not used anywhere...
    common_module.controller('ModalAddLocationCtrl', modal_add_location);
    common_module.controller('ModalCreateInstrumentCtrl', modal_create_instrument);
    common_module.controller('ModalBulkRowQAChangeCtrl', modal_bulk_rowqa_change);
    common_module.controller('ModalSaveSuccess', modal_save_success);
    common_module.controller('ModalCreateFishermanCtrl', modal_create_fisherman);
    common_module.controller('ModalExportController', modal_exportfile);
    common_module.controller('LinkModalCtrl', modal_link_field);
    common_module.controller('ModalVerifyActionCtrl', modal_verify_action);
    common_module.controller('ModalInvalidOperation', modal_invalid_operation);

    //common_module.controller('FileAddModalCtrl', modal_file_add);
    //common_module.controller('FileDeleteModalCtrl', modal_file_delete);
    common_module.controller('FileModalCtrl', modal_files); 
    common_module.controller('WaypointFileModalCtrl', modal_waypoint_files);
    
});


//We load these asych with the others
require([
    //loads chart services
    'core/common/components/chart/adultweir-chartservice',
    'core/common/components/chart/artificialproduction-chartservice',
    'core/common/components/chart/bsample-chartservice',
    'core/common/components/chart/creelsurvey-chartservice',
    'core/common/components/chart/electrofishing-chartservice',
    'core/common/components/chart/snorkelfish-chartservice',
    'core/common/components/chart/waterquality-chartservice',
    'core/common/components/chart/watertemp-chartservice',

], function () {

    //there is a chartservice for each dataset.
    // NOTE: If you are creating a new dataset, you'll want to make a chartservice for it.
    common_module.service('AdultWeir_ChartService', adultweir_chartservice);
    common_module.service('ArtificialProduction_ChartService', artificialproduction_chartservice);
    common_module.service('BSample_ChartService', bsample_chartservice);
    common_module.service('CreelSurvey_ChartService', creelsurvey_chartservice);
    common_module.service('ElectroFishing_ChartService', electrofishing_chartservice);
    common_module.service('SnorkelFish_ChartService', snorkelfish_chartservice);
    common_module.service('WaterQuality_ChartService', waterquality_chartservice);
    common_module.service('WaterTemp_ChartService', watertemp_chartservice);

    //and then we only load this one after the others are done...
    require([
        'core/common/components/chart/chart-services',                    //the wrapper for them all...
    ], function () {
        //the master chartservice that exposes all of the other dataset-specific chart services
        common_module.service('ChartService', chart_services);
        
    });
});

define([
    'app',
    'esri/map',
    'esri/geometry/Point',
    'esri/dijit/InfoWindow',
    'esri/InfoTemplate',
    'esri/dijit/BasemapLayer',
    'esri/dijit/BasemapGallery',
    'esri/dijit/Basemap',
    'esri/virtualearth/VETiledLayer'
], function (app, Map, Point, InfoWindow, InfoTemplate, VETiledLayer) {


    /*
      <esri-map class="claro" id="map" center="-118.45,45.56" zoom="10" basemap="streets" onclick="click">
                        <esri-feature-layer url="//restdata.ctuir.org/arcgis/rest/services/CDMS_ProjectPoints/FeatureServer/0" filter="location"></esri-feature-layer>
                  </esri-map>
     */

    common_module.getLocationMapLayer = function () {

        var mapOptions = {
            center: (-118.45, 45.56),
            zoom: (10),
            spatialReference: {
                wkid: 102100 //mercator
                //wkid:26911 //nad_1983
                //"wkt":'PROJCS["NAD83(NSRS2007) / UTM zone 11N",GEOGCS["NAD83(NSRS2007)",DATUM["D_",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-117],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["Meter",1]]'
            }
        };

        // declare our map
        var map = new Map('map', mapOptions);
        map.locationLayer = map.addLayer(MapPointsLayer); 

        return map;
    };

    
});