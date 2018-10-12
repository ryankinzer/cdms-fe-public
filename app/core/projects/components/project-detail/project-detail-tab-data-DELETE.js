//Data tab on the Project Details page.

var tab_data = ['$scope', function (scope) {

    var linkTemplate = function (param) {

        var div = document.createElement('div');

        var linkBtn = document.createElement('a');
        linkBtn.href = '#/' + param.data.activitiesRoute + '/' + param.data.Id;
        linkBtn.innerHTML = param.data.Name;

        div.appendChild(linkBtn);

        return div;
    };

    //datasets tab grid
    scope.dataGridOptions = {
        //data: 'datasets',
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        onGridReady: function (params) {
            params.api.sizeColumnsToFit();
        },
        columnDefs:
        [
            { field: 'Name', headerName: 'Dataset Name', cellRenderer: linkTemplate, width: 280 },
            { field: 'Description', headerName: 'Description', width: 450 },
        ]
    };

    var data_ds_watcher = scope.$parent.$watch('datasets', function () {

        if (typeof scope.datasets === 'undefined' || scope.datasets.length === 0)
            return;

        //console.log(" ----------- we have datasets! loading grid for data! -------------");
        //console.dir(scope.datasets);

        data_ds_watcher(); //turn off watcher

        var ag_grid_div = document.querySelector('#data-tab-grid');    //get the container id...
        //console.dir(ag_grid_div);
        scope.datatab_ag_grid = new agGrid.Grid(ag_grid_div, scope.dataGridOptions); //bind the grid to it.
        scope.dataGridOptions.api.showLoadingOverlay(); //show loading...

        scope.dataGridOptions.api.setRowData(scope.$parent.datasets);
        scope.dataGridOptions.api.sizeColumnsToFit(); //

    }, true);

}];