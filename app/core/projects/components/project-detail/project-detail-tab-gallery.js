//This controller handles the Gallery tab on the Project Details page. 

var tab_gallery = ['$scope','$document', '$timeout', function (scope, $document, $timeout) {


    var fileLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
        '<img src="assets/images/file_image.png" width="100px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
        '</a>' +
        '</div>';

    var uploadedBy = '<div class="ngCellText" ng-class="col.colIndex()">' +
        '{{row.getProperty("UploadDate")|date}} by {{row.getProperty("User.Fullname")}}' +
        '</div>';


    var EditLinksTemplate = function (param) {

        var div = document.createElement('div');

        var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
        editBtn.addEventListener('click', function (event) {
            event.preventDefault();
            scope.openEditFileModal(param.data, scope.afterEditGalleryFile);
        });
        div.appendChild(editBtn);
        div.appendChild(document.createTextNode("|"));

        var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
        delBtn.addEventListener('click', function (event) {
            event.preventDefault();
            scope.openDeleteFileModal(param.data, scope.afterDeleteGalleryFile);
        });
        div.appendChild(delBtn);

        return div;
    };


    var linkTemplate = function (param) {

        var div = document.createElement('div');

        var linkBtn = document.createElement('a');
        linkBtn.href = '#/' + param.data.activitiesRoute + '/' + param.data.Id;
        linkBtn.innerHTML = param.data.Name;

        div.appendChild(linkBtn);

        return div;
    };

    //scope.fileSelection = [];
    //scope.FileFilterOptions = {};
    //scope.GalleryFilterOptions = {};

    /////////// gallery grid
    scope.galleryGridOptions = {
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'single',
        onSelectionChanged: function (params) {
            console.log("selection changed!");
            //scope.galleryGridOptions.selectedItems = scope.galleryGridOptions.api.getSelectedRows();
            //console.dir(scope.galleryGridOptions.selectedItems);
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
        },
        onFilterModified: function () {
            scope.galleryGridOptions.api.deselectAll();
        },
        //selectedItems: [],
        columnDefs:
        [
            { cellRenderer: EditLinksTemplate, width: 80 },
            { field: 'Name', headerName: 'File Name', width: 250, sort: 'asc' },
            { field: 'Title', headerName: 'Title' },
            { field: 'Description', headerName: 'Description' },
            { field: 'Uploaded', headerName: "Uploaded", width: 200 },
        ]
    };

    $document.ready(function () {
        console.log("------------ setting up watcvher after doc ready ");
        //after the project files are loaded by our parent, they are split into two arrays. project.Images is ours.
        var gallery_ds_watcher = scope.$parent.$watch('project', function () {

            if (typeof scope.project === 'undefined' || typeof scope.project.Images === 'undefined')
                return;

            console.log("Gallery tab has a project loaded!");

            gallery_ds_watcher(); //turn off watcher

            //////// Load the gallery grid
            console.log(" ---------- OK gallery has window onload ");
            var ag_grid_div = document.querySelector('#gallery-tab-grid');    //get the container id...
            console.dir(ag_grid_div);


            $timeout(function () {
                ag_grid_div = angular.element(document.getElementById('gallery-tab-grid'));
                console.dir(ag_grid_div);
                ag_grid_div = ag_grid_div.context;
                scope.gallerytab_ag_grid = new agGrid.Grid(ag_grid_div, scope.galleryGridOptions); //bind the grid to it.
                scope.galleryGridOptions.api.showLoadingOverlay(); //show loading...
                scope.galleryGridOptions.api.setRowData(scope.project.Images);
                scope.galleryGridOptions.api.sizeColumnsToFit();
            },0);
            

        }, true);

    });

    ///////// file handling for Gallery tab

    //open the new file modal
    scope.newGalleryFile = function () {
        scope.openNewFileModal(scope.afterNewGalleryFile);
    };

    //after create a new file
    scope.afterNewGalleryFile = function (new_item) {
        scope.project.Images.push(new_item[0]);
        scope.project.Files.push(new_item[0]);
        scope.galleryGridOptions.api.setRowData(scope.project.Images);
        console.log("done reloading grid after editing gallery item.");
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
    scope.afterDeleteGalleryFile = function (removed_item) {
        scope.project.Images.forEach(function (item, index) {
            if (item.Id === removed_item.File.Id) {
                scope.project.Images.splice(index, 1);
            }
        });

        scope.removeFromFiles(removed_item);

        scope.galleryGridOptions.api.setRowData(scope.project.Images);
        console.log("done reloading grid after removing image item.");
    };
}];






