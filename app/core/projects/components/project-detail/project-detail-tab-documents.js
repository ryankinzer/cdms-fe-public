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

    });
    
    ///////// file handling for Documents tab

    //open the new file modal
    scope.newFile = function () {
        scope.openNewFileModal(scope.afterNewDocsFile);
    };

    //after create a new file
    scope.afterNewDocsFile = function (new_item) {
        //console.log("After saved a doc");
        //console.dir(new_item[0]);
        scope.project.Docs.push(new_item[0]);
        scope.project.Files.push(new_item[0]);
        scope.docsGridOptions.api.setRowData(scope.project.Docs);
        console.log("done reloading grid after editing docs item.");
    };


    //remove an item from our project docs list and then reload the grid.
    scope.afterDeleteDocsFile = function (removed_item) {        
        scope.project.Docs.forEach(function (item, index) {
            console.log("item id is " + item.Id + " looking for " + removed_item.File.Id);
            if (item.Id === removed_item.File.Id) {
                console.log("FOund an ID that matches for delete");
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






