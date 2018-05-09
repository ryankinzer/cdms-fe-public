//This controller handles the Documents tab on the Project Details page. 

var tab_docs = ['$scope', '$document', '$timeout', function (scope, $document, $timeout) {


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
        div.appendChild(document.createTextNode("|"));

        var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
        delBtn.addEventListener('click', function (event) {
            event.preventDefault();
            scope.openDeleteFileModal(param.data, scope.afterDeleteDocsFile);
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

    /*
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
    */

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
            { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 80, menuTabs: [], hide: true },
            //{ field: 'Name', headerName: 'File', width: 250, sort: 'asc', cellRenderer: LinkTemplate },
            { field: 'Title', headerName: 'Title', sort: 'asc', cellRenderer: LinkTemplate, width: 230, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'Description', headerName: 'Description', menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'Uploaded', headerName: "Uploaded", width: 200, valueGetter: UploadedByTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
        ]
    };

    /*
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
    */

    $document.ready(function () {

        //after the project files are loaded by our parent, they are split into two arrays. project.Docs is ours.
        var docs_ds_watcher = scope.$parent.$watch('project.Docs', function () {
            console.log(' ------------------------------------------------------ docs');
            console.dir(scope.project.Docs);
            if (typeof scope.project.Docs === 'undefined')
                return;
            
            ///////// Load the docs grid
            $timeout(function () {

                var ag_grid_div = document.querySelector('#docs-tab-grid');    //get the container id...

                if (typeof scope.docstab_ag_grid === 'undefined')
                    scope.docstab_ag_grid = new agGrid.Grid(ag_grid_div, scope.docsGridOptions); //bind the grid to it.

                scope.docsGridOptions.api.showLoadingOverlay(); //show loading...
                scope.docsGridOptions.api.setRowData(scope.project.Docs);
                scope.docsGridOptions.api.sizeColumnsToFit();

                //if user can edit, unhide the edit links
                if (scope.canEdit(scope.project))
                    scope.docsGridOptions.columnApi.setColumnVisible("EditLinks", true);

                if (scope.project.Docs.length > 0)
                    docs_ds_watcher(); //turn off watcher
            }, 0);

        }, true);


        /*var project_gallery_watcher = scope.$watch('project.Images', function () {
            console.log("Inside project_gallery_watcher...");

            if (typeof scope.project === 'undefined' || typeof scope.project.Id === 'undefined') {
                console.log("not ready yet! --> project loading --> ");
                console.dir(scope.project);
                return;
            }

            //scope.project.Files.forEach(function (file) {
            //    if (file.FileType.Name === "Image") { //images go to 'Gallery' tab
            //        scope.project.Images.push(file);
            //    }
            //});
            scope.project.Images = angular.copy($rootScope.project.Images);

            project_gallery_watcher();

        }, true); //end after project gallery watcher.
        */
        /*
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
        */

    });

    /*
    var gallery_ds_watcher = scope.$parent.$watch('project.Images', function () {

        if (typeof scope.project.Images === 'undefined')
            return;

        //////// Load the gallery grid
        $timeout(function () {

            var ag_grid_div = document.querySelector('#gallery-tab-grid');    //get the container id...

            ag_grid_div = angular.element(document.getElementById('gallery-tab-grid'));
            ag_grid_div = ag_grid_div.context;

            //if (typeof scope.gallerytab_ag_grid === 'undefined')
            //    scope.gallerytab_ag_grid = new agGrid.Grid(ag_grid_div, scope.galleryGridOptions); //bind the grid to it.

            //scope.galleryGridOptions.api.showLoadingOverlay(); //show loading...
            scope.galleryGridOptions.api.setRowData(scope.project.Images);
            //scope.galleryGridOptions.api.sizeColumnsToFit();

            //if user can edit, unhide the edit links
            if (scope.canEdit(scope.project))
                scope.galleryGridOptions.columnApi.setColumnVisible("EditLinks", true);


            if (scope.project.Images.length > 0)
                gallery_ds_watcher();

        }, 0);
        

    }, true);
    */

    scope.grids.docsGridOptions = scope.docsGridOptions;

    ///////// file handling for Documents tab

    //open the new file modal
    scope.newFile = function () {
        scope.openNewFileModal(scope.afterNewDocsFile);
    };

    //after create a new file
    scope.afterNewDocsFile = function (new_item) {
        console.log("After saved a doc");
        //console.dir(new_item[0]);
        if (new_item[0].FileTypeId === 1)
        {
            var ag_grid_div = undefined;
            scope.project.Images.push(new_item[0]);
            scope.project.Files.push(new_item[0]);
            scope.$parent.grids.galleryGridOptions.api.setRowData(scope.project.Images); // This line refreshes the grid on the gallery tab.
        }
        else {
            scope.project.Docs.push(new_item[0]);
            scope.project.Files.push(new_item[0]);
            scope.docsGridOptions.api.setRowData(scope.project.Docs); // This line refreshes the grid on the documents tab.
        }
        console.log("done reloading grid after editing docs item.");
    };


    //remove an item from our project docs list and then reload the grid.
    scope.afterDeleteDocsFile = function (removed_item) {        
        scope.project.Docs.forEach(function (item, index) {
            console.log("item id is " + item.Id + " looking for " + removed_item.File.Id);
            if (item.Id === removed_item.File.Id) {
                console.log("Found an ID that matches for delete");
                scope.project.Docs.splice(index, 1);
            }
        });

        scope.removeFromFiles(removed_item);

        scope.docsGridOptions.api.setRowData(scope.project.Docs);
        console.log("done reloading grid after removing doc item.");
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

}];






