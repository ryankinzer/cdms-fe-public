// defines the project module and all project controllers.

//project module and its dependencies
var projects_module = angular.module('ProjectModule', ['ui.bootstrap', 'angularFileUpload', 'ui.select2']);

//load the controllers for this module

require([
    'app/core/projects/components/project-detail/project-detail',
    'app/core/projects/components/project-detail/modal-new-file',
    'app/core/projects/components/project-detail/modal-edit-project',
    'app/core/projects/components/project-detail/modal-delete-file',

    'app/core/projects/components/project-list/project-list',
    'app/core/projects/components/project-list/modal-add-accuracy-check',

], function () {
    //add the controllers to the module once the files are loaded!
    
    //controllers from the project-detail component
    projects_module.controller('project-detail-ctrl', project_detail);
    projects_module.controller('ModalEditFileCtrl', modal_new_file);
    projects_module.controller('ModalProjectEditorCtrl', modal_edit_project);
    projects_module.controller('ModalDeleteFileCtrl', modal_delete_file);

    //controllers from the project-list component
    projects_module.controller('project-list-ctrl', project_list);
    projects_module.controller('ModalAddAccuracyCheckCtrl', module_add_accuracy_check);

});



//define routes?

//define controllers? (or maybe these will be defined in the controller file = better...)





// TODO *************
// move this out into its own utility somewhere.

//might be a list of metadata values from project.Metadata or a list of actual properties.
function addMetadataProperties(metadata_list, all_metadata, scope, DataService) {
    angular.forEach(metadata_list, function (i_property, key) {

        var property = i_property;
        if (i_property.MetadataPropertyId) //is it a value from project.Metadata? if so then grab the property.
            property = DataService.getMetadataProperty(i_property.MetadataPropertyId);

        //property var is a "metadataProperty" (not a metadata value)

        //console.log("typeof property.Name = " + property.Name);
        //if (typeof property.Name !== 'undefined')
        //	console.log("property.Name = " + property.Name);
        //else
        //	console.log("property.Name = " + "'undefined'");

        //if it isn't already there, add it as an available option
        //if(!(property.Name in all_metadata))
        if ((typeof property.Name !== 'undefined') && (property.Name !== null) && !(property.Name in all_metadata)) {
            scope.metadataList[property.Name] =
                {
                    field: property.Name,
                    MetadataPropertyId: property.Id,
                    controlType: property.ControlType,
                };
        }

        //set the value no matter what if we have it.
        if (i_property.Values) {
            if (property.ControlType == "multiselect") {
                //need to see if we are dealing with old style (just a list) or if it is a bonafide object.
                var values;
                try {
                    values = angular.fromJson(i_property.Values);
                }
                catch (e)  //if we can't then it wasn't an object... use split instead.
                {
                    values = i_property.Values.split(",")
                }

                all_metadata[property.Name].Values = values;
            }
            else {
                all_metadata[property.Name].Values = i_property.Values;
            }

            if (scope.project)
                scope.project.MetadataValue[property.Id] = all_metadata[property.Name].Values; //make it easy to get values by metadata id.
        }
        else
            all_metadata[property.Name].Values = "";



        if (property.PossibleValues) {
            populateMetadataDropdowns(scope, property); //setup the dropdown
            all_metadata[property.Name].options = scope.CellOptions[property.Id + "_Options"];
        }


    });
};



