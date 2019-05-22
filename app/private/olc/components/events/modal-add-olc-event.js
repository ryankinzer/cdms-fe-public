
var modal_add_olc_event = ['$scope', '$rootScope', '$uibModalInstance', '$uibModal', 'DatasetService', 'SubprojectService', 'CommonService', 'ServiceUtilities', 
    '$filter', 'Upload', '$location', '$anchorScroll',
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, SubprojectService, CommonService, ServiceUtilities,
        $filter, $upload, $location, $anchorScroll) {

        console.log("Inside ModalAddOlcEventCtrl...");

        $scope.setupOlcMetaFields = function () {

            // row.column (from database) and metadata name
            $scope.olcMetaFieldColumns = {
                "Boundary": "Boundary",
                "SignificantArea": "Significant Area",
                "MiscelleneousContext": "Miscelleneous Context"
            };

            if ($scope.project.MetaFields)
                return;


            var olcfields = CommonService.getMetadataFor($scope.project.Id, METADATA_ENTITY_OLCEVENTS);
            olcfields.$promise.then(function () {

                $scope.project.MetaFields = [];

                var projFields = CommonService.getMetadataFor($scope.project.Id, METADATA_ENTITY_PROJECT);

                projFields.$promise.then(function () {

                    //projFields.forEach(function (projfield) {
                    //    if (projfield.Name == "Boundary" || projfield.Name == "Significant Area") || (olcfield.Name !== "MiscellensiousContext")) { //include only these from proj
                    //        projfield.isOlc = true;
                    //        $scope.project.MetaFields.push(projfield);
                    //    }
                    //});

                    olcfields.forEach(function (olcfield) {
                        if ((olcfield.Name === "Boundary") || (olcfield.Name === "SignificantArea") || (olcfield.Name === "MiscellensiousContext")) { //include
                            olcfields.isHabitat = true;
                            $scope.project.MetaFields.push(olcfield);
                        }
                    });

                    $scope.project.MetaFields.forEach(function (field) {
                        field.DbColumnName = field.Label = field.Name;
                    });

                    console.dir($scope.project.MetaFields);
                    console.dir($scope.event_row);

                });

            });
        };

        //mixin the properties and functions to enable the modal file chooser for this controller...
        modalFiles_setupControllerForFileChooserModal($scope, $modal, $scope.viewSubproject.Files); //"EventFiles"

        if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
            $rootScope.subprojectId = $scope.viewSubproject.Id;
        {
            $scope.setupOlcMetaFields()
        }
        var foundIt = false;

        // If even_row.Id is greater than 0, we're editing...
        if ($scope.event_row.Id > 0) {
            $scope.header_message = "Edit Event for Catalog Number " + $scope.viewSubproject.CatalogNumber;
        }
        else {
            if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
                $scope.header_message = "Add Event to Project " + $scope.viewSubproject.CatalogNumber;
            else if ((typeof $scope.CatalogNumber !== 'undefined') && ($scope.CatalogNumber !== null))
                $scope.header_message = "Add Event to Project " + $scope.CatalogNumber;
        }

        //console.log("$scope.event_row is next...");
        //console.dir($scope.event_row);

        $scope.field = {
            DbColumnName: "FileAttach"
        };

        //callback that is called from modalFile to do the actual file removal (varies by module)
        $scope.modalFile_doRemoveFile = function (file_to_remove, saveRow) {
            return SubprojectService.deleteOlcEventFile($scope.projectId, $scope.subprojectId, saveRow.Id, file_to_remove);
        };

        //called when the user clicks "save"
        $scope.save = function () {
            console.log("Inside ModalAddOlcEventCtrl, save...");

            // Areas
            console.log("$scope.event_row.strAreas = " + $scope.event_row.strAreas);
            console.log("type of $scope.event_row.strAreas = " + typeof $scope.event_row.strAreas);

            console.log("$scope.event_row.DocumentType = " + $scope.event_row.DocumentType);
            var saveRow = angular.copy($scope.event_row);
            console.log("saveRow is next, before checking the Id...");
            console.dir(saveRow);
            if (!saveRow.Id)
                saveRow.Id = 0;

            /*
            //copy the bound vars into the column fields to save
            if ($scope.olcMetaFieldColumns) {
                Object.keys($scope.olcMetaFieldColumns).forEach(function (col) {
                    try {
                        //saveRow[col] = angular.toJson($scope.event_row[$scope.olcMetaFieldColumns[col]]);
                        saveRow[col] = angular.toJson($scope.event_row[$scope.olcMetaFieldColumns[col]]);
                        delete saveRow[$scope.olcMetaFieldColumns[col]];
                    } catch (e) {
                        console.warn("had a problem but carrying on...");
                        console.dir(e);
                    }
                });
            }
            */

            var subprojectId = 0;
            if ($scope.viewSubproject)
                subprojectId = $scope.viewSubproject.Id;
            else
                subprojectId = $scope.subprojectId;

            //this gets passed along via api call... TODO: this is just to get going...
            var data = {
                ProjectId: $scope.project.Id,
                SubprojectId: subprojectId,
                DatastoreTablePrefix: $scope.DatastoreTablePrefix,
            };

            var target = '/api/v1/olcsubproject/uploadolcsubprojectfile';

            $scope.handleFilesToUploadRemove(saveRow, data, target, $upload); //when done (handles failed files, etc., sets in scope objects) then calls modalFiles_saveParentItem below.


        };

        //call back from save above once the files are done processing and we're ready to save the item
        $scope.modalFile_saveParentItem = function (saveRow) {
            //prepare to save the correspondence event
            // Now let's handle the other fields on the form.
            console.log("typeof saveRow.DocumentDate = " + typeof saveRow.DocumentDate);
            if ((typeof saveRow.DocumentDate !== 'undefined') && (saveRow.DocumentDate !== null) && (typeof saveRow.DocumentDate !== "string")) {
                console.log("saveRow.DocumentDate = " + saveRow.DocumentDate);
                var strDocumentDate = ServiceUtilities.toExactISOString(saveRow.DocumentDate);
                console.log("strDocumentDate = " + strDocumentDate);
                saveRow.DocumentDate = ServiceUtilities.extractDateFromString(strDocumentDate);
                console.log("saveRow.DocumentDate = " + saveRow.DocumentDate);
            }

            console.log("typeof saveRow.DateDiscovered = " + typeof saveRow.DateDiscovered);
            if ((typeof saveRow.DateDiscovered !== 'undefined') && (saveRow.DateDiscovered !== null) && (typeof saveRow.DateDiscovered !== "string")) {
                var strDateDiscovered = ServiceUtilities.toExactISOString(saveRow.DateDiscovered);
                console.log("strDateDiscovered = " + strDateDiscovered);
                saveRow.DateDiscovered = ServiceUtilities.extractDateFromString(strDateDiscovered);
                console.log("saveRow.DateDiscovered = " + saveRow.DateDiscovered);
            }

            console.log("saveRow is next, after processing dates...");
            console.dir(saveRow);

            // Response Type:  If the user selected Other, we must use the name they supplied in OtherResponseType.
            //if ((saveRow.OtherResponseType) && (typeof saveRow.OtherResponseType !== 'undefined'))
            //if (saveRow.ResponseType === "Other") {
            //    saveRow.ResponseType = saveRow.OtherResponseType;
            //    saveRow.OtherResponseType = 'undefined'; // Throw this away, because we do not want to save it; no database field or it.
            //}

            //console.log("$scope is next...");
            //console.dir($scope);


            var save_item_promise = SubprojectService.saveOlcEvent($scope.project.Id, $scope.viewSubproject.Id, saveRow);

            //setup the promise.then that runs after the olc event is saved...
            if (typeof save_item_promise !== 'undefined') {

                save_item_promise.$promise.then(function () {
                    //did we edit or add new?
                    if (saveRow.Id === 0) //we saved a new one!
                        $scope.postAddOlcEventUpdateGrid(save_item_promise);
                    else //we edited one!
                        $scope.postEditOlcEventUpdateGrid(save_item_promise);


                    console.log("all done saving olc event!");

                    if (!$scope.filesToUpload[$scope.file_field] && !$scope.removedFiles.length > 0) {
                        $modalInstance.dismiss();
                    }

                });

                console.log("1 typeof $scope.errors = " + typeof $scope.errors + ", $scope.fileCount = " + $scope.fileCount + ", $scope.fileProgress = " + $scope.fileProgress);
                if ($scope.fileCount === 0) {
                    $scope.loading = false; // Stop the fish spinner.
                    $scope.showCloseButton = true;
                    $scope.showCancelButton = false;
                    $scope.showFormItems = false;
                }

                if ($scope.filesWithErrors === 0)
                    $scope.UploadUserMessage = "All actions successful.";
                else
                    $scope.UploadUserMessage = "There was a problem uploading a file.  Please try again or contact the Helpdesk if this issue continues.";

            }
        };

        $scope.close = function () {
            console.log("Inside $scope.close...");
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {

            if ($scope.originalExistingFiles && $scope.originalExistingFiles.hasOwnProperty($scope.file_field)) {
                $scope.ce_row.EventFiles = $scope.originalExistingFiles[$scope.file_field];
                //console.log("setting EventFiles to " + $scope.originalExistingFiles[$scope.file_field]);
            }

            $modalInstance.dismiss();
        };

    }
];
