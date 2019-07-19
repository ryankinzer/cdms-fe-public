
var modal_add_olc_event = ['$scope', '$rootScope', '$uibModalInstance', '$uibModal', 'DatasetService', 'SubprojectService', 'CommonService', 'ServiceUtilities', 
    '$filter', 'Upload', '$location', '$anchorScroll',
    function ($scope, $rootScope, $modalInstance, $modal, DatasetService, SubprojectService, CommonService, ServiceUtilities,
        $filter, $upload, $location, $anchorScroll) {

        console.log("Inside ModalAddOlcEventCtrl...");

        $scope.filesWithErrors = 0;

        $scope.setupOlcMetaFields = function () {

            // row.column (from database) and metadata name
            $scope.olcMetaFieldColumns = {
                "Boundary": "Boundary",
                "SignificantArea": "Significant Area",
                "MiscellaneousContext": "Miscellaneous Context"
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
            $scope.setupOlcMetaFields();
        }
        var foundIt = false;

        // If event_row.Id is greater than 0, we're editing...
        if ($scope.event_row.Id > 0) {
            $scope.header_message = "Edit Event for Catalog Number " + $scope.viewSubproject.CatalogNumber;
        }
        else {
            if ((typeof $scope.viewSubproject !== 'undefined') && ($scope.viewSubproject !== null))
                $scope.header_message = "Add Event to Project " + $scope.viewSubproject.CatalogNumber;
            else if ((typeof $scope.CatalogNumber !== 'undefined') && ($scope.CatalogNumber !== null))
                $scope.header_message = "Add Event to Project " + $scope.CatalogNumber;
        }

        if ((typeof $scope.event_row.Boundary !== 'undefined') && ($scope.event_row.Boundary !== null)) {

            try {
                $scope.event_row.Boundary = JSON.parse($scope.event_row.Boundary);
            } catch (e) {
                console.log("$scope.event_row.Boundary is already parsed into JSON...");
            }
            //$scope.event_row.strBoundaries = "";

            //$scope.event_row.Boundary.forEach(function (boundary) {
            //    $scope.event_row.strBoundaries += boundary + ";\n";
            //});
            
        }

        if ((typeof $scope.event_row.OtherBoundary !== 'undefined') && ($scope.event_row.OtherBoundary !== null)) {

            $scope.showOtherBoundary = true;
        }
        else {
            $scope.showOtherBoundary = false;
        }

        if ((typeof $scope.event_row.SignificantArea !== 'undefined') && ($scope.event_row.SignificantArea !== null)) {

            //$scope.event_row.SignificantArea = JSON.parse($scope.event_row.SignificantArea);
            try {
                $scope.event_row.SignificantArea = JSON.parse($scope.event_row.SignificantArea);
            } catch (e) {
                console.log("$scope.event_row.SignificantArea is already parsed into JSON...");
            }
        }

        if ((typeof $scope.event_row.MiscellaneousContext !== 'undefined') && ($scope.event_row.MiscellaneousContext !== null)) {

            //$scope.event_row.MiscellaneousContext = JSON.parse($scope.event_row.MiscellaneousContext);
            try {
                $scope.event_row.MiscellaneousContext = JSON.parse($scope.event_row.MiscellaneousContext);
            } catch (e) {
                console.log("$scope.event_row.MiscellaneousContext is already parsed into JSON...");
            }
        }

        if ((typeof $scope.event_row.SurveyDates !== 'undefined') && ($scope.event_row.SurveyDates !== null)) {
            if (!isArray($scope.event_row.SurveyDates))
                $scope.event_row.SurveyDates = convertStringWithSeparatorsToStringWithSeparatorsAndReturns($scope.event_row.SurveyDates);
            else {
                var tmpArySurveyDates = convertStringArrayToNoralString($scope.event_row.SurveyDates);

                //var arySurveyDates = $scope.event_row.SurveyDates.split(';');
                var arySurveyDates = tmpArySurveyDates.split(';');

                $scope.event_row.SurveyDates = "";

                var intCount = 0;
                arySurveyDates.forEach(function (item) {
                    if (intCount === 0)
                        $scope.event_row.SurveyDates += item;
                    else
                        $scope.event_row.SurveyDates += ";\n" + item;

                    intCount++;
                });
            }


        }

        if ((typeof $scope.event_row.Description !== 'undefined') && ($scope.event_row.Description !== null)) {
            $scope.event_row.Description = convertStringWithSeparatorsToStringWithSeparatorsAndReturns($scope.event_row.Description);
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

        $scope.selectBoundary = function () {
            $scope.showOtherBoundary = false;

            // Walk the list of options the user has selected, and see if one of them is Other.
            $scope.event_row.Boundary.forEach(function (item) {
                if (item === "Other")
                    $scope.showOtherBoundary = true;
            });

        };

        $scope.addBoundary = function () {
            console.log("+B clicked...");
            console.log("$scope.event_row.strBoundaries (at top of addBoundary) = " + $scope.event_row.strBoundaries);

            if (typeof $scope.event_row.Boundary === 'undefined')
                return;

            if (typeof $scope.event_row.strBoundaries === 'undefined')
                $scope.event_row.strBoundaries = "";

            // We will add a new line at the end, so that the string presents well on the page.
            //if ($scope.row.Collaborators === "Other") {
            //    $scope.row.strCollaborators += $scope.row.OtherCollaborators + ";\n";
            //}
            //else {
            $scope.event_row.strBoundaries += $scope.event_row.Boundary + ";\n";
            //}

            console.log("$scope.event_row.strBoundaries (at bottom of addBoundary) = " + $scope.event_row.strBoundaries);
        };

        $scope.removeBoundary = function () {
            console.log("-B clicked...");
            console.log("$scope.event_row.strBoundaries before stripping = " + $scope.event_row.strBoundaries);

            $scope.event_row.strBoundaries = convertStringWithSeparatorsAndReturnsToNormalString($scope.event_row.strBoundaries);

            var aryBoundaries = $scope.event_row.strBoundaries.split(";");

            $scope.event_row.strBoundaries = removeStringItemFromList($scope.event_row.Boundary, aryBoundaries);

            console.log("Finished.");
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
            //prepare to save the OLC event
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

            if ((typeof saveRow.SurveyDates !== 'undefined') && (saveRow.SurveyDates !== null)) {
                console.log("saveRow.SurveyDates = " + saveRow.SurveyDates);

                // First, strip out the new line characters.
                //saveRow.SurveyDates = saveRow.SurveyDates.replace(/(\r\n|\r|\n)/gm, "");
                saveRow.SurveyDates = convertStringWithSeparatorsAndReturnsToNormalString(saveRow.SurveyDates);
                console.log("saveRow.SurveyDates after stripping = " + saveRow.SurveyDates);

                // We don't want to send this, so delete it.
                saveRow.SurveyDate = undefined;
            }

            if ((typeof saveRow.Description !== 'undefined') && (saveRow.Description !== null)) {
                console.log("saveRow.Description = " + saveRow.Description);

                // First, strip out the new line characters.
                //saveRow.SurveyDates = saveRow.SurveyDates.replace(/(\r\n|\r|\n)/gm, "");
                saveRow.Description = convertStringWithSeparatorsAndReturnsToNormalString(saveRow.Description);
                console.log("saveRow.Description after stripping = " + saveRow.Description);

                // We don't want to send this, so delete it.
                saveRow.DescriptionItem = undefined;
            }

            //saveRow.Boundaries = JSON.stringify(saveRow.Boundaries);
            //console.log("saveRow.Boundaries = " + saveRow.Boundaries);

            // Wipe the field, before rebuilding it with what we want to save.
            //saveRow.Boundary = [];

            /*
            if ((typeof saveRow.strBoundaries !== 'undefined') && (saveRow.strBoundaries !== null) && (saveRow.strBoundaries.length > 0)) {
                $rootScope.boundaryPresent = $scope.boundaryPresent = true;
                var strBoundaries = saveRow.strBoundaries.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
                console.log("strBoundaries = " + strBoundaries);
                var aryBoundaries = saveRow.strBoundaries.split(";");  // 
                //aryCollaborators.splice(-1, 1);

                angular.forEach(aryBoundaries, function (item) {
                    //After the split on ";", one of the lines is a newline.  We need to watch for and omit that line.
                    //console.log("item = X" + item + "X");
                    //item = item.replace(/(\r\n|\r|\n)/gm, "");
                    item = item.replace(/\n/g, "");
                    //console.log("item = X" + item + "X");

                    if (item.length > 0) {
                        var boundaryOption = new Object();
                        boundaryOption.Id = 0;
                        boundaryOption.Name = "";

                        boundaryOption.Name = item.trim();
                        //console.log("collaboratorOption.Name = " + collaboratorOption.Name);

                        //saveRow.Boundary.push(boundaryOption);
                        saveRow.Boundary.push(item.trim());
                    }
                });
                saveRow.Boundary = JSON.stringify(saveRow.Boundary);
                saveRow.strBoundaries = undefined;
            }
            */

            if ((typeof saveRow.Boundary !== 'undefined') && (saveRow.Boundary !== null)) {
                saveRow.Boundary = JSON.stringify(saveRow.Boundary);
                console.log("saveRow.Boundary = " + saveRow.Boundary);
            }

            if ((typeof saveRow.SignificantArea !== 'undefined') && (saveRow.SignificantArea !== null)) {
                saveRow.SignificantArea = JSON.stringify(saveRow.SignificantArea);
                console.log("saveRow.SignificantArea = " + saveRow.SignificantArea);
            }

            if ((typeof saveRow.MiscellaneousContext !== 'undefined') && (saveRow.MiscellaneousContext !== null)) {
                saveRow.MiscellaneousContext = JSON.stringify(saveRow.MiscellaneousContext);
                console.log("saveRow.MiscellaneousContext = " + saveRow.MiscellaneousContext);
            }

            console.log("saveRow is next, after processing dates...");
            console.dir(saveRow);

            //throw ("Stopping right here...");

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

        $scope.modalFile_closeParentItem = function () {
            console.log("Inside $scope.modalFile_closeParentItem...");

            if ($scope.fileCount === 0) {
                $scope.loading = false; // Stop the fish spinner.
                $scope.showCloseButton = true;
                $scope.showCancelButton = false;
                $scope.showFormItems = false;
            }

            if ($scope.filesWithErrors === 0)
                $scope.UploadUserMessage = "All actions successful.";
            else
                $scope.UploadUserMessage = "There was a problem moving a file.  Please try again or contact the Helpdesk if this issue continues.";

            $scope.close();
        };

        $scope.close = function () {
            console.log("Inside $scope.close...");
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {

            if ($scope.originalExistingFiles && $scope.originalExistingFiles.hasOwnProperty($scope.file_field)) {
                $scope.event_row.EventFiles = $scope.originalExistingFiles[$scope.file_field];
                //console.log("setting EventFiles to " + $scope.originalExistingFiles[$scope.file_field]);
            }

            if ((typeof $scope.event_row.SurveyDates !== 'undefined') && ($scope.event_row.SurveyDates !== null))
                if (isArray($scope.event_row.SurveyDates)) 
                    $scope.event_row.SurveyDates = convertStringArrayToNoralString($scope.event_row.SurveyDates);
                else
                    $scope.event_row.SurveyDates = convertStringWithSeparatorsAndReturnsToNormalString($scope.event_row.SurveyDates);

            if ((typeof $scope.event_row.Description !== 'undefined') && ($scope.event_row.Description !== null))
                $scope.event_row.Description = convertStringWithSeparatorsAndReturnsToNormalString($scope.event_row.Description);


            $modalInstance.dismiss();
        };

        $scope.migrateEvent = function () {
            console.log("Inside migrateEvent...")
            console.log("$scope is next...");
            console.dir($scope.event_row);

            $rootScope.SubprojectId = $scope.SubprojectId = $scope.event_row.SubprojectId;
            //console.log("ok subproject set: ");
            //console.dir($scope.viewSubproject);

            //$scope.event_row = event_row;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/olc/components/events/templates/modal-migrate-olc-event.html',
                controller: 'OlcMigrateEventCtrl',
                scope: $scope //very important to pass the scope along...
            });
        };

        $scope.addDescription = function () {
            console.log("+D clicked...");
            console.log("$scope.row.DescriptionItem = " + $scope.event_row.DescriptionItem);

            if ((typeof $scope.event_row.DescriptionItem === 'undefined') || ($scope.event_row.DescriptionItem === null))
                return;

            // We will add a new line at the end, so that the string presents well on the page.
            if ((typeof $scope.event_row.Description === 'undefined') || ($scope.event_row.Description === null))
                $scope.event_row.Description = "";

            $scope.event_row.Description += $scope.event_row.DescriptionItem + ";\n";

            console.log("$scope.event_row.Description = " + $scope.event_row.Description);
        };

        $scope.removeDescription = function () {
            console.log("-D clicked...");
            console.log("$scope.event_row.Description before stripping = " + $scope.event_row.Description);

            $scope.event_row.Description = convertStringWithSeparatorsAndReturnsToNormalString($scope.event_row.Description);

            var aryDescription = $scope.event_row.Description.split(";");

            $scope.event_row.Description = removeStringItemFromList($scope.event_row.DescriptionItem, $scope.event_row.Description);

        };

        $scope.addSurveyDate = function () {
            console.log("+SD clicked...");
            console.log("$scope.row.SurveyDate = " + $scope.event_row.SurveyDate);

            if ((typeof $scope.event_row.SurveyDate === 'undefined') || ($scope.event_row.SurveyDate === null))
                return;

            if ((typeof $scope.event_row.SurveyDates === 'undefined') || ($scope.event_row.SurveyDates === null))
                $scope.event_row.SurveyDates = "";

            // We will add a new line at the end, so that the string presents well on the page.
            $scope.event_row.SurveyDates += getDateFromDate($scope.event_row.SurveyDate) + ";\n";

            console.log("$scope.event_row.SurveyDates = " + $scope.event_row.SurveyDates);
        };

        $scope.removeSurveyDate = function () {
            console.log("-SD clicked...");
            console.log("$scope.row.SurveyDates before stripping = " + $scope.event_row.SurveyDates);

            // First, strip out the new line characters.
            $scope.event_row.SurveyDates = $scope.event_row.SurveyDates.replace(/(\r\n|\r|\n)/gm, "");
            console.log("$scope.event_row.SurveyDates after stripping = " + $scope.event_row.SurveyDates);

            // Note, we still have the trailing semicolon.
            // Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
            var arySurveyDates = $scope.event_row.SurveyDates.split(";");

            // Next, get rid of that trailing semicolon.
            arySurveyDates.splice(-1, 1);
            console.dir(arySurveyDates);

            // Now we can continue with the delete action.
            var arySurveyDatesLength = arySurveyDates.length;

            for (var i = 0; i < arySurveyDatesLength; i++) {
                console.log("arySurveyDates[i] = " + arySurveyDates[i]);
                var utcOffset = moment().utcOffset();
                var searchDate = null;

                if (utcOffset === -420) {

                    searchDate = moment($scope.event_row.SurveyDate).add(1,'days').format('YYYY-MM-DD');
                }
                else if (utcOffset === -480)
                    searchDate = moment($scope.event_row.SurveyDate).add(1080, 'minutes').format('YYYY-MM-DD');

                searchDate = getDateFromDate(searchDate);

                console.log("searchDate = " + searchDate);
                //var searchDate = getDateFromDate($scope.event_row.SurveyDate);
                var listDate = arySurveyDates[i];

                //if (arySurveyDates[i].indexOf(moment($scope.event_row.SurveyDate, "YYYY-MM-DD")) > -1) {
                if (listDate.indexOf(searchDate) > -1) {
                    console.log("Found the item...");
                    arySurveyDates.splice(i, 1);
                    console.log("Removed the item.");

                    $scope.event_row.SurveyDates = "";
                    console.log("Wiped $scope.event_row.SurveyDates...");

                    // Rebuild the string now, adding the semicolon and newline after every line.
                    angular.forEach(arySurveyDates, function (item) {
                        $scope.event_row.SurveyDates += item + ";\n";
                        console.log("Added item...");
                    });

                    // Since we found the item, skip to then end to exit.
                    i = arySurveyDatesLength;
                }
            }
            console.log("Finished.");
        };

    }
];
