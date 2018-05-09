//This controller handles the Gallery tab on the Project Details page. 

var tab_gallery = ['$scope','$timeout', function (scope, $timeout) {

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
        div.appendChild(document.createTextNode("|"));

        var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
        delBtn.addEventListener('click', function (event) {
            event.preventDefault();
            scope.openDeleteFileModal(param.data, scope.afterDeleteGalleryFile);
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
            { field: 'Uploaded', headerName: "Uploaded", width: 200, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
        ]
    };

    //$document.ready(function () {
        //after the project files are loaded by our parent, they are split into two arrays. project.Images is ours.
        var gallery_ds_watcher = scope.$parent.$watch('project.Images', function () {

            if (typeof scope.project.Images === 'undefined')
                return;

            //////// Load the gallery grid
            $timeout(function () {

                var ag_grid_div = document.querySelector('#gallery-tab-grid');    //get the container id...
    
                ag_grid_div = angular.element(document.getElementById('gallery-tab-grid'));
                ag_grid_div = ag_grid_div.context;

                if (typeof scope.gallerytab_ag_grid === 'undefined')
                    scope.gallerytab_ag_grid = new agGrid.Grid(ag_grid_div, scope.galleryGridOptions); //bind the grid to it.

                scope.galleryGridOptions.api.showLoadingOverlay(); //show loading...
                scope.galleryGridOptions.api.setRowData(scope.project.Images);
                scope.galleryGridOptions.api.sizeColumnsToFit();

                //if user can edit, unhide the edit links
                if (scope.canEdit(scope.project))
                    scope.galleryGridOptions.columnApi.setColumnVisible("EditLinks", true);


                if (scope.project.Images.length > 0)
                    gallery_ds_watcher();

            },0);
            

        }, true);

    //});

        scope.grids.galleryGridOptions = scope.galleryGridOptions;

    ///////// file handling for Gallery tab

    //open the new file modal
    scope.newGalleryFile = function () {
        scope.openNewFileModal(scope.afterNewGalleryFile);
    };

    //after create a new file
    scope.afterNewGalleryFile = function (new_item) {
        console.log("After saved a image");
        //scope.galleryGridOptions.api.setRowData(scope.project.Images);
        if (new_item[0].FileTypeId === 1) {
            var ag_grid_div = undefined;
            scope.project.Images.push(new_item[0]);
            scope.project.Files.push(new_item[0]);
            scope.galleryGridOptions.api.setRowData(scope.project.Images); // This line refreshes the grid on the gallery tab.
        }
        else {
            scope.project.Docs.push(new_item[0]);
            scope.project.Files.push(new_item[0]);
            scope.$parent.grids.docsGridOptions.api.setRowData(scope.project.Docs); // This line refreshes the grid on the documents tab.
        }

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






