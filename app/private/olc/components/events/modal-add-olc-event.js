
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
        }

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

        $scope.addBoundary = function () {
            console.log("+B clicked...");
            console.log("$scope.event_row.strBoundaries (at top of addBoundary) = " + $scope.event_row.strBoundaries);

            // If Boundary was blank when the user clicked the plus...
            if (typeof $scope.event_row.Boundaries === 'undefined')
                return;

            if (typeof $scope.event_row.strBoundaries === 'undefined')
                $scope.event_row.strBoundaries = "";

            // We will add a new line at the end, so that the string presents well on the page.
            //if ($scope.row.Collaborators === "Other") {
            //    $scope.row.strCollaborators += $scope.row.OtherCollaborators + ";\n";
            //}
            //else {
            $scope.event_row.strBoundaries += $scope.event_row.Boundaries + ";\n";
            //}

            console.log("$scope.event_row.strBoundaries (at bottom of addBoundary) = " + $scope.event_row.strBoundaries);
        };

        $scope.removeBoundary = function () {
            console.log("-B clicked...");
            console.log("$scope.event_row.strBoundaries before stripping = " + $scope.event_row.strBoundaries);

            // First, strip out the new line characters.
            $scope.event_row.strBoundaries = $scope.event_row.strBoundaries.replace(/(\r\n|\r|\n)/gm, "");
            console.log("$scope.event_row.strBoundaries after stripping = " + $scope.event_row.strBoundaries);

            // Note, we still have the trailing semicolon.
            // Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
            var aryBoundaries = $scope.event_row.strBoundaries.split(";");

            // Next, get rid of that trailing semicolon.
            aryBoundaries.splice(-1, 1);
            console.dir(aryBoundaries);

            // Now we can continue with the delete action.
            var aryBoundariesLength = aryBoundaries.length;

            // First check if the user entered an "other" funder.
            //if (($scope.row.Collaborators === "Other") && ($scope.row.OtherCollaborators)) {
            //    for (var i = 0; i < aryCollaboratorsLength; i++) {
            //        console.log("aryCollaborators[i] = " + aryCollaborators[i]);
            //        if (aryCollaborators[i].indexOf($scope.row.OtherCollaborators) > -1) {
            //            console.log("Found the item...");
            //            aryCollaborators.splice(i, 1);
            //            console.log("Removed the item.");

            //            $scope.row.strCollaborators = "";
            //            console.log("Wiped $scope.row.strCollaborators...");

            // Rebuild the string now, adding the semicolon and newline after every line.
            //            angular.forEach(aryCollaborators, function (item) {
            //                $scope.row.strCollaborators += item + ";\n";
            //                console.log("Added item...");
            //            });

            // Since we found the item, skip to then end to exit.
            //            i = aryCollaboratorsLength;
            //        }
            //    }
            //}
            //else {
            for (var i = 0; i < aryBoundariesLength; i++) {
                console.log("aryBoundaries[i] = " + aryBoundaries[i]);
                if (aryBoundaries[i].indexOf($scope.event_row.Boundaries) > -1) {
                    console.log("Found the item...");
                    aryBoundaries.splice(i, 1);
                    console.log("Removed the item.");

                    $scope.event_row.strBoundaries = "";
                    console.log("Wiped $scope.event_row.strBoundaries...");

                    // Rebuild the string now, adding the semicolon and newline after every line.
                    angular.forEach(aryBoundaries, function (item) {
                        $scope.event_row.strBoundaries += item + ";\n";
                        console.log("Added item...");
                    });

                    // Since we found the item, skip to then end to exit.
                    i = aryBoundariesLength;
                }
            }
            //}
            console.log("Finished.");
        };

        $scope.addSignificantArea = function () {
            console.log("+S clicked...");
            console.log("$scope.event_row.strSignificantArea (at top of addaddSignificantArea) = " + $scope.event_row.strSignificantArea);

            if (typeof $scope.event_row.SignificantArea === 'undefined')
                return;

            if (typeof $scope.event_row.strSignificantArea === 'undefined')
                $scope.event_row.strSignificantArea = "";

            // We will add a new line at the end, so that the string presents well on the page.
            //if ($scope.row.Collaborators === "Other") {
            //    $scope.row.strCollaborators += $scope.row.OtherCollaborators + ";\n";
            //}
            //else {
            $scope.event_row.strSignificantArea += $scope.event_row.SignificantArea + ";\n";
            //}

            console.log("$scope.event_row.strSignificantArea (at bottom of addSignificantArea) = " + $scope.event_row.strSignificantArea);
        };

        $scope.removeSignificantArea = function () {
            console.log("-S clicked...");
            console.log("$scope.event_row.strSignificantArea before stripping = " + $scope.event_row.strSignificantArea);

            // First, strip out the new line characters.
            $scope.event_row.strSignificantArea = $scope.event_row.strSignificantArea.replace(/(\r\n|\r|\n)/gm, "");
            console.log("$scope.event_row.strSignificantArea after stripping = " + $scope.event_row.strSignificantArea);

            // Note, we still have the trailing semicolon.
            // Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
            var arySignificantArea = $scope.event_row.strSignificantArea.split(";");

            // Next, get rid of that trailing semicolon.
            arySignificantArea.splice(-1, 1);
            console.dir(arySignificantArea);

            // Now we can continue with the delete action.
            var arySignificantAreaLength = arySignificantArea.length;

            // First check if the user entered an "other" funder.
            //if (($scope.row.Collaborators === "Other") && ($scope.row.OtherCollaborators)) {
            //    for (var i = 0; i < aryCollaboratorsLength; i++) {
            //        console.log("aryCollaborators[i] = " + aryCollaborators[i]);
            //        if (aryCollaborators[i].indexOf($scope.row.OtherCollaborators) > -1) {
            //            console.log("Found the item...");
            //            aryCollaborators.splice(i, 1);
            //            console.log("Removed the item.");

            //            $scope.row.strCollaborators = "";
            //            console.log("Wiped $scope.row.strCollaborators...");

            // Rebuild the string now, adding the semicolon and newline after every line.
            //            angular.forEach(aryCollaborators, function (item) {
            //                $scope.row.strCollaborators += item + ";\n";
            //                console.log("Added item...");
            //            });

            // Since we found the item, skip to then end to exit.
            //            i = aryCollaboratorsLength;
            //        }
            //    }
            //}
            //else {
            for (var i = 0; i < arySignificantAreaLength; i++) {
                console.log("arySignificantArea[i] = " + arySignificantArea[i]);
                if (arySignificantArea[i].indexOf($scope.event_row.SignificantArea) > -1) {
                    console.log("Found the item...");
                    arySignificantArea.splice(i, 1);
                    console.log("Removed the item.");

                    $scope.event_row.strSignificantArea = "";
                    console.log("Wiped $scope.event_row.strSignificantArea...");

                    // Rebuild the string now, adding the semicolon and newline after every line.
                    angular.forEach(arySignificantArea, function (item) {
                        $scope.event_row.strSignificantArea += item + ";\n";
                        console.log("Added item...");
                    });

                    // Since we found the item, skip to then end to exit.
                    i = arySignificantAreaLength;
                }
            }
            //}
            console.log("Finished.");
        };

        $scope.addMiscelleneousContext = function () {
            console.log("+S clicked...");
            console.log("$scope.event_row.strSignificantArea (at top of addMiscelleneousContext) = " + $scope.event_row.strMiscelleneousContext);

            if (typeof $scope.event_row.MiscelleneousContext === 'undefined')
                return;

            if (typeof $scope.event_row.strMiscelleneousContext === 'undefined')
                $scope.event_row.strMiscelleneousContext = "";

            // We will add a new line at the end, so that the string presents well on the page.
            //if ($scope.row.Collaborators === "Other") {
            //    $scope.row.strCollaborators += $scope.row.OtherCollaborators + ";\n";
            //}
            //else {
            $scope.event_row.strMiscelleneousContext += $scope.event_row.MiscelleneousContext + ";\n";
            //}

            console.log("$scope.event_row.strMiscelleneousContext (at bottom of addMiscelleneousContext) = " + $scope.event_row.strMiscelleneousContext);
        };

        $scope.removeMiscelleneousContext = function () {
            console.log("-M clicked...");
            console.log("$scope.event_row.strMiscelleneousContext before stripping = " + $scope.event_row.strMiscelleneousContext);

            // First, strip out the new line characters.
            $scope.event_row.strMiscelleneousContext = $scope.event_row.strMiscelleneousContext.replace(/(\r\n|\r|\n)/gm, "");
            console.log("$scope.event_row.strMiscelleneousContext after stripping = " + $scope.event_row.strMiscelleneousContext);

            // Note, we still have the trailing semicolon.
            // Convert the string to an array, so that we can easily remove the applicable funding agency from the string.
            var aryMiscelleneousContext = $scope.event_row.strMiscelleneousContext.split(";");

            // Next, get rid of that trailing semicolon.
            aryMiscelleneousContext.splice(-1, 1);
            console.dir(aryMiscelleneousContext);

            // Now we can continue with the delete action.
            var aryMiscelleneousContextLength = aryMiscelleneousContext.length;

            // First check if the user entered an "other" funder.
            //if (($scope.row.Collaborators === "Other") && ($scope.row.OtherCollaborators)) {
            //    for (var i = 0; i < aryCollaboratorsLength; i++) {
            //        console.log("aryCollaborators[i] = " + aryCollaborators[i]);
            //        if (aryCollaborators[i].indexOf($scope.row.OtherCollaborators) > -1) {
            //            console.log("Found the item...");
            //            aryCollaborators.splice(i, 1);
            //            console.log("Removed the item.");

            //            $scope.row.strCollaborators = "";
            //            console.log("Wiped $scope.row.strCollaborators...");

            // Rebuild the string now, adding the semicolon and newline after every line.
            //            angular.forEach(aryCollaborators, function (item) {
            //                $scope.row.strCollaborators += item + ";\n";
            //                console.log("Added item...");
            //            });

            // Since we found the item, skip to then end to exit.
            //            i = aryCollaboratorsLength;
            //        }
            //    }
            //}
            //else {
            for (var i = 0; i < aryMiscelleneousContextLength; i++) {
                console.log("aryMiscelleneousContext[i] = " + aryMiscelleneousContext[i]);
                if (aryMiscelleneousContext[i].indexOf($scope.event_row.MiscelleneousContext) > -1) {
                    console.log("Found the item...");
                    aryMiscelleneousContext.splice(i, 1);
                    console.log("Removed the item.");

                    $scope.event_row.strMiscelleneousContext = "";
                    console.log("Wiped $scope.event_row.strMiscelleneousContext...");

                    // Rebuild the string now, adding the semicolon and newline after every line.
                    angular.forEach(aryMiscelleneousContext, function (item) {
                        $scope.event_row.strMiscelleneousContext += item + ";\n";
                        console.log("Added item...");
                    });

                    // Since we found the item, skip to then end to exit.
                    i = aryMiscelleneousContextLength;
                }
            }
            //}
            console.log("Finished.");
        };

        //called when the user clicks "save"
        $scope.save = function () {
            console.log("Inside ModalAddOlcEventCtrl, save...");

            // Areas
            console.log("$scope.event_row.strAreas = " + $scope.event_row.strAreas);
            console.log("type of $scope.event_row.strAreas = " + typeof $scope.event_row.strAreas);


            
            if ((typeof $scope.event_row.strSignificantArea !== 'undefined') && ($scope.event_row.strSignificantArea !== null) && ($scope.event_row.strSignificantArea.length > 0)) {
                $rootScope.areasPresent = $scope.areasPresent = true;
                var strAreas = $scope.event_row.strSignificantArea.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
                console.log("strSignificantArea = " + strSignificantArea);
                var aryAreas = $scope.event_row.strSignificantArea.split(";");  // 
                //aryCollaborators.splice(-1, 1);

                angular.forEach(aryAreas, function (item) {
                    //After the split on ";", one of the lines is a newline.  We need to watch for and omit that line.
                    //console.log("item = X" + item + "X");
                    //item = item.replace(/(\r\n|\r|\n)/gm, "");
                    item = item.replace(/\n/g, "");
                    //console.log("item = X" + item + "X");

                    if (item.length > 0) {
                        var areaOption = new Object();
                        areaOption.Id = 0;
                        areaOption.Name = "";

                        areaOption.Name = item.trim();
                        //console.log("areaOption.Name = " + areaOption.Name);

                        if (!$scope.event_row.SignificantArea)
                            $scope.event_row.SignificantArea = [];

                        $scope.event_row.SignificantArea.push(areaOption);
                    }
                });
                $scope.event_row.strSignificantArea = undefined;
            }

            if ((typeof $scope.event_row.strBoundaries !== 'undefined') && ($scope.event_row.strBoundaries !== null) && ($scope.event_row.strBoundaries.length > 0)) {
                $rootScope.boundariesPresent = $scope.boundariesPresent = true;
                var strBoundaries = $scope.event_row.strBoundaries.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
                console.log("strBoundaries = " + strBoundaries);
                var aryBoundaries = $scope.event_row.strBoundaries.split(";");  // 
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
                        //console.log("boundaryOption.Name = " + boundaryOption.Name);

                        if (!$scope.event_row.Boundary)
                            $scope.event_row.Boundary = [];

                        $scope.event_row.Boundary.push(boundaryOption);
                    }
                });
                $scope.event_row.strBoundaries = undefined;
            }

            if ((typeof $scope.event_row.strMiscContexts !== 'undefined') && ($scope.event_row.strMiscContexts !== null) && ($scope.event_row.strMiscContexts.length > 0)) {
                $rootScope.miscContextsPresent = $scope.miscContextsPresent = true;
                var strMiscContexts = $scope.event_row.strMiscContexts.replace(/(\r\n|\r|\n)/gm, "");  // Remove all newlines (used for presentation).
                console.log("strMiscContexts = " + strMiscContexts);
                var aryMiscContexts = $scope.event_row.strMiscContexts.split(";");  // 
                //aryCollaborators.splice(-1, 1);

                angular.forEach(aryMiscContexts, function (item) {
                    //After the split on ";", one of the lines is a newline.  We need to watch for and omit that line.
                    //console.log("item = X" + item + "X");
                    //item = item.replace(/(\r\n|\r|\n)/gm, "");
                    item = item.replace(/\n/g, "");
                    //console.log("item = X" + item + "X");

                    if (item.length > 0) {
                        var contextOption = new Object();
                        contextOption.Id = 0;
                        contextOption.Name = "";

                        contextOption.Name = item.trim();
                        //console.log("contextOption.Name = " + contextOption.Name);

                        if (!$scope.event_row.MiscContexts)
                            $scope.event_row.MiscContexts = [];

                        $scope.event_row.MiscContexts.push(contextOption);
                    }
                });
                $scope.event_row.strMiscContexts = undefined;
            }
            

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
                subprojectId = $scope.viewSubproject.Id
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
            if ((typeof saveRow.DocumentDate !== 'undefined') && (typeof saveRow.DocumentDate !== "string")) {
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
