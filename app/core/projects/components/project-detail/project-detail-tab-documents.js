//This controller handles the Documents tab on the Project Details page. 

var tab_docs = ['$scope', '$document', '$timeout', function (scope, $document, $timeout) {

    
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


    ///////////////documents grid
    scope.docsGridOptions = {
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowSelection: 'single',
        onSelectionChanged: function (params) {
            console.log("selection changed!");
            scope.docsGridOptions.selectedItems = scope.docsGridOptions.api.getSelectedRows();
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
         },
        onFilterModified: function () {
            scope.docsGridOptions.api.deselectAll();
        },
        selectedItems: [],
        columnDefs:
        [
            { field: 'Name', headerName: 'File Name',  width: 250 },
            { field: 'Title', headerName: 'Title' },
            { field: 'Description', headerName: 'Description' },
            { field: 'Uploaded', headerName: "Uploaded",  width: 200 },
        ]
    };


    $document.ready(function () {

        //after the project files are loaded by our parent, they are split into two arrays. project.Docs is ours.
        var docs_ds_watcher = scope.$parent.$watch('project.Docs', function () {

            if (typeof scope.project.Docs === 'undefined' || scope.project.Docs.length === 0)
                return;

            console.log("Documents tab has docs loaded!");

            docs_ds_watcher(); //turn off watcher

            ///////// Load the docs grid
            $timeout(function () {

                console.log("************************************************************************* angular ready... documents ");
                var ag_grid_div = document.querySelector('#docs-tab-grid');    //get the container id...

                scope.docstab_ag_grid = new agGrid.Grid(ag_grid_div, scope.docsGridOptions); //bind the grid to it.
                scope.docsGridOptions.api.showLoadingOverlay(); //show loading...
                scope.docsGridOptions.api.setRowData(scope.project.Docs);
                scope.docsGridOptions.api.sizeColumnsToFit();
            }, 0);

        }, true);

    });
    
    ///////// file handling for Documents tab
    scope.deleteFile = function () {
        scope.openDeleteFileModal(scope.fileSelection[0]);
    };

    scope.editFile = function () {
        scope.openEditFileModal(scope.fileSelection[0]);
    };

    scope.newFile = function () {
        scope.uploadFileType = "document";
        scope.openNewFileModal();
    };
    
}];






