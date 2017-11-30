//This controller handles the Gallery tab on the Project Details page. 

var tab_gallery = ['$scope','$document', '$timeout', function (scope, $document, $timeout) {


    var fileLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
        '<img src="assets/images/file_image.png" width="100px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
        '</a>' +
        '</div>';

    var uploadedBy = '<div class="ngCellText" ng-class="col.colIndex()">' +
        '{{row.getProperty("UploadDate")|date}} by {{row.getProperty("User.Fullname")}}' +
        '</div>';



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
            scope.galleryGridOptions.selectedItems = scope.galleryGridOptions.api.getSelectedRows();
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
        },
        onFilterModified: function () {
            scope.galleryGridOptions.api.deselectAll();
        },
        selectedItems: [],
        columnDefs:
        [
            { field: 'Name', headerName: 'File Name', width: 250 },
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
    scope.deleteGalleryFile = function () {
        scope.openDeleteFileModal(scope.galleryFileSelection[0]);
    };

    scope.editGalleryFile = function () {
        scope.openEditFileModal(scope.galleryFileSelection[0]);
    };

    scope.newGalleryFile = function () {
        scope.uploadFileType = "image";
        scope.openNewFileModal();
    };
}];






