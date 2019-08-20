/*
*   This page loads the project files (gallery and documents)
*/

var project_files = ['$scope', '$routeParams','SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http', '$timeout',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window, $http, $timeout,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {
		
        scope.OnTab = "Files";

        scope.project = ProjectService.getProject(routeParams.Id);

        scope.UserIsAdmin = false;
        scope.UserIsOwner = false;
        scope.UserIsEditor = false;
        
        scope.metadataList = {};

		scope.uploadFileType = "";
		scope.filesToUpload = {};
		scope.AuthorizedToViewProject = true;

        scope.project.$promise.then(function () {

            //load all of the project's files
            scope.project.Files = ProjectService.getProjectFiles(scope.project.Id);

            //since we want a tab of images and a tab of other files, 
            // sort them out into three arrays we will use to populate the tabs.
            scope.project.Images = [];
            scope.project.Docs = [];
            scope.project.SubprojectFiles = [];

            //once they load... (the docs and gallery tabs listen for this and then handle their grids.)
            scope.project.Files.$promise.then(function () {
                console.log('-------------- project FILES are loaded >>>>>>>>>>>>>>>> ');
                //console.dir(scope.project.Files);

                scope.project.Files.forEach(function (file, key) {
                    // If the user created a document and left the Title or Description blank, those fields were saved as "undefined" in the database.
                    // When we read the list of files back in, the "undefined" shows on the page, and the user would rather have a blank show instead.
                    file.Title = (!file.Title || file.Title === 'undefined' || typeof file.Title === 'undefined') ? "" : file.Title;
                    file.Description = (!file.Description || file.Description === 'undefined' || typeof file.Description === 'undefined') ? "" : file.Description;

                    //here we'll sort the files into some arrays...
                    // scope.project.Docs = document tab
                    // scope.project.Images = images tab
                    // scope.project.SubprojectFiles = subproject files <-- TODO: someday refactor this away so that projects are just nested...

                    //note: Subproject_CrppId indicates the file belongs to a subproject (not just crpp)
                    if (file.DatasetId === null && file.Subproject_CrppId === null) {
                        if (file.FileType.Name === "Image") { //images go to 'Gallery' tab
                            scope.project.Images.push(file);
                        } else { //everything else goes to 'Documents' tab
                            scope.project.Docs.push(file);
                        }
                    } else {
                        scope.project.SubprojectFiles.push(file);
                    }
                });
                console.log("OK! Done loading files for project");

                angular.element(function () { 
                    scope.activateGalleryGrid();
                    scope.activateDocumentsGrid();
                });
                
                
            });
        });		

        

        //return an array from the eventfiles.
        scope.getFilesArrayAsList = function (theFiles) {
            if (theFiles === undefined || theFiles === null)
                return [];

            var files = angular.fromJson(theFiles);
            return (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make an empty array

        }

        //return an array of file links to cdmsShareUrl (defined in config) for subproject
        scope.getSubprojectFilesArrayAsLinks = function(a_projectId, a_subprojectId, a_files)
        {
            var files = scope.getFilesArrayAsList(a_files);
            var retval = [];

            angular.forEach(files, function (file, value) {
                retval.push("<a href='" + cdmsShareUrl + "P/" + a_projectId + "/S/" + a_subprojectId + "/" + file.Name + "' target=\"_blank\">" + file.Name + "</a>");
            });

            return retval;
        }


        //selection to edit, callback to fire on success.
        scope.openEditFileModal = function (a_selection, a_callback) {
            scope.row = a_selection;
            scope.callback = a_callback;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-edit-file.html',
                controller: 'ModalEditFileCtrl',
                scope: scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            });
        };

        scope.openNewFileModal = function (a_callback) {
            scope.callback = a_callback;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/projects/components/project-detail/templates/modal-upload-files.html',
                controller: 'ModalNewFileCtrl',
                windowClass: 'modal-large',
                backdrop  : 'static',
                keyboard  : false,
                scope: scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            });
        };

        //removes the given file from project.Files (usually after deleting an item from docs/gallery already)
        scope.removeFromFiles = function (removed_item) {
            scope.project.Files.forEach(function (item, index) {
                //console.log("item id is " + item.Id + " looking for " + removed_item.File.Id);
                if (item.Id === removed_item.Id) {
                    //console.log("FOund an ID that matches for delete");
                    scope.project.Files.splice(index, 1);
                }
            });
        };

        scope.canEdit = function (project) {
            return $rootScope.Profile.canEdit(project);
        };

//from gallerytab

        var UploadedByTemplate = function (param) {
            //console.dir(param);
            //console.log("uploaded by template!");
            return moment(param.node.data.UploadDate).format('L') + " by " + param.node.data.User.Fullname;
        };

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openEditFileModal(param.data, scope.afterEditGalleryFile);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.deleteGalleryFile(param.data);
            });
            div.appendChild(delBtn);

            return div;
        };


        var ImageTemplate = function (param) {

            var div = document.createElement('div');

            var linkBtn = document.createElement('a');
            linkBtn.href = param.data.Link;
            linkBtn.target = "_blank";

            var img = document.createElement('img');
            img.src = param.data.Link;
            img.width = 150;

            linkBtn.appendChild(img);
            div.appendChild(linkBtn);

            return div;
        };

        //scope.fileSelection = [];
        //scope.FileFilterOptions = {};
        //scope.GalleryFilterOptions = {};
    
        /////////// gallery grid
        scope.galleryGridOptions = {
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed!");
                //scope.galleryGridOptions.selectedItems = scope.galleryGridOptions.api.getSelectedRows();
                //console.dir(scope.galleryGridOptions.selectedItems);
                //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            getRowHeight: function () { return 120; },
            onFilterModified: function () {
                scope.galleryGridOptions.api.deselectAll();
            },
            //selectedItems: [],
            columnDefs:
            [
                { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 120, menuTabs: [], hide: true },
                { headerName: 'File', cellRenderer: ImageTemplate, width: 190, menuTabs: [] },
                { field: 'Title', headerName: 'Title', width: 250, sort: 'asc', menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
                { headerName: 'Sharing Level', field: 'SharingLevel', width: 150, 
                    cellRenderer: function (params) { 
                        if (params.node.data.SharingLevel == SHARINGLEVEL_PRIVATE)
                            return SharingLevel['SHARINGLEVEL_PRIVATE'];
                        else if (params.node.data.SharingLevel == SHARINGLEVEL_PUBLICREAD)
                            return SharingLevel['SHARINGLEVEL_PUBLICREAD'];
                        else return 'Unknown';
                    }, menuTabs: [], 
                },
                { field: 'Uploaded', headerName: "Uploaded", width: 200, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
            ],
            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };

        scope.activateGalleryGrid = function () {

            //////// Load the gallery grid

                var ag_grid_div = document.querySelector('#gallery-tab-grid');    //get the container id...

                if (typeof scope.gallerytab_ag_grid === 'undefined')
                    scope.gallerytab_ag_grid = new agGrid.Grid(ag_grid_div, scope.galleryGridOptions); //bind the grid to it.

                scope.galleryGridOptions.api.showLoadingOverlay(); //show loading...
                scope.galleryGridOptions.api.setRowData(scope.project.Images);
                scope.galleryGridOptions.api.sizeColumnsToFit();

                //if user can edit, unhide the edit links
                if (scope.canEdit(scope.project))
                    scope.galleryGridOptions.columnApi.setColumnVisible("EditLinks", true);

        };

        //edit our project images list and then reload the grid.
        scope.afterEditGalleryFile = function (edited_item) {
            scope.project.Images.forEach(function (item, index) {
                if (item.Id === edited_item.Id) {
                    angular.extend(hab_item, edited_item); //replace the data for that item
                }
            });

            scope.galleryGridOptions.api.setRowData(scope.project.Images);
            console.log("done reloading grid after editing gallery item.");
        };

        //remove an image from our project docs list and then reload the grid.
        scope.deleteGalleryFile = function (removed_item) {

            if (confirm("Are you sure you want to delete this file? (there is no undo)")) { 
                var promise = ProjectService.deleteFile(scope.project.Id, removed_item);

                promise.$promise.then(function () { 
                    scope.project.Images.forEach(function (item, index) {
                        if (item.Id === removed_item.Id) {
                            scope.project.Images.splice(index, 1);
                        }
                    });

                    scope.removeFromFiles(removed_item);

                    scope.galleryGridOptions.api.setRowData(scope.project.Images);
                    console.log("done reloading grid after removing image item.");
                });
            }
            
        };



/// from the files tab -------------------


        var UploadedByTemplate = function (param) {
            return moment(param.node.data.UploadDate).format('L') + " by " + param.node.data.User.Fullname;
        };

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openEditFileModal(param.data, scope.afterEditDocsFile);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.deleteDocFile(param.data);
            });
            div.appendChild(delBtn);

            return div;
        };
    
        var LinkTemplate = function (param) {

            var div = document.createElement('div');

            var linkBtn = document.createElement('a');
            linkBtn.href = param.data.Link;
            linkBtn.innerHTML = param.data.Title;
            linkBtn.target = "_blank";
            div.appendChild(linkBtn);
            return div;
        };


        ///////////////documents grid
        scope.docsGridOptions = {
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed!");
                scope.docsGridOptions.selectedItems = scope.docsGridOptions.api.getSelectedRows();
                //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
             },
            onFilterModified: function () {
                scope.docsGridOptions.api.deselectAll();
            },
            //selectedItems: [],
            columnDefs:
            [
                { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 120, menuTabs: [], hide: true },
                //{ field: 'Name', headerName: 'File', width: 250, sort: 'asc', cellRenderer: LinkTemplate },
                { field: 'Title', headerName: 'Title', sort: 'asc', cellRenderer: LinkTemplate, width: 230, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Description', headerName: 'Description', menuTabs: ['filterMenuTab'], filter: 'text' },
                { headerName: 'Sharing Level', field: 'SharingLevel', width: 150, 
                    cellRenderer: function (params) { 
                        if (params.node.data.SharingLevel == SHARINGLEVEL_PRIVATE)
                            return SharingLevel['SHARINGLEVEL_PRIVATE'];
                        else if (params.node.data.SharingLevel == SHARINGLEVEL_PUBLICREAD)
                            return SharingLevel['SHARINGLEVEL_PUBLICREAD'];
                        else return 'Unknown';
                    }, menuTabs: [], 
                },
                { field: 'Uploaded', headerName: "Uploaded", width: 200, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
            ],
            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };



        scope.activateDocumentsGrid = function () {
            var ag_grid_div = document.querySelector('#docs-tab-grid');    //get the container id...

            if (typeof scope.docstab_ag_grid === 'undefined')
                scope.docstab_ag_grid = new agGrid.Grid(ag_grid_div, scope.docsGridOptions); //bind the grid to it.

            scope.docsGridOptions.api.showLoadingOverlay(); //show loading...
            scope.docsGridOptions.api.setRowData(scope.project.Docs);
            scope.docsGridOptions.api.sizeColumnsToFit();

            //if user can edit, unhide the edit links
            if (scope.canEdit(scope.project))
                scope.docsGridOptions.columnApi.setColumnVisible("EditLinks", true);

        };



        ///////// file handling for Documents tab

        //open the new file modal
        scope.newFile = function () {
            scope.openNewFileModal(scope.afterNewFile);
        };

        //after create a new file
        scope.afterNewFile = function (new_item) {
            console.log("After saved a doc");
            //console.dir(new_item[0]);
            if (new_item[0].FileTypeId === 1)
            {
                var ag_grid_div = undefined;
                scope.project.Images.push(new_item[0]);
                scope.project.Files.push(new_item[0]);
                scope.galleryGridOptions.api.setRowData(scope.project.Images); 
            }
            else {
                scope.project.Docs.push(new_item[0]);
                scope.project.Files.push(new_item[0]);
                scope.docsGridOptions.api.setRowData(scope.project.Docs); // This line refreshes the grid on the documents tab.
            }
            console.log("done reloading grid after adding docs item.");
        };


        //remove an item from our project docs list and then reload the grid.
        scope.deleteDocFile = function (removed_item) {        
            if (confirm("Are you sure you want to delete this file? (there is no undo)")) { 
                var promise = ProjectService.deleteFile(scope.project.Id, removed_item);

                promise.$promise.then(function () { 
                    scope.project.Docs.forEach(function (item, index) {
                        if (item.Id === removed_item.Id) {
                            scope.project.Docs.splice(index, 1);
                        }
                    });

                    scope.removeFromFiles(removed_item);

                    scope.docsGridOptions.api.setRowData(scope.project.Docs);
                    console.log("done reloading grid after removing doc item.");
                });
            }
        };

        //edit our project docs list and then reload the grid.
        scope.afterEditDocsFile = function (edited_item) {
            scope.project.Docs.forEach(function (item, index) {
                if (item.Id === edited_item.Id) {
                    angular.extend(hab_item, edited_item); //replace the data for that item
                }
            });

            scope.docsGridOptions.api.setRowData(scope.project.Docs);
            console.log("done reloading grid after editing doc item.");
        };


        //handle favorite toggle
        scope.isFavorite = $rootScope.Profile.isProjectFavorite(routeParams.Id);
        scope.toggleFavorite = function () { 
            UserService.toggleFavoriteProject(scope, $rootScope); 
        }

        
}];






