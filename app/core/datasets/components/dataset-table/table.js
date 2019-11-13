
var table_editor = ['$scope', '$routeParams','GridService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$rootScope', '$uibModal', '$sce', '$window', 
    function (scope, routeParams, GridService, ProjectService, DatasetService, CommonService, UserService, $rootScope, $modal, $sce, $window ) {


        scope.dataset = DatasetService.getDataset(routeParams.Id);

        scope.dataset.$promise.then(function(){

            scope.tabledata = DatasetService.getTableData(routeParams.Id);

            scope.tabledata.$promise.then(function () {
                scope.tableGrid.api.setRowData(scope.tabledata);
            });

            scope.TableDatasetColumnDefs = GridService.getAgColumnDefs(scope.dataset);

            scope.tableGrid.columnDefs = angular.copy(scope.TableDatasetColumnDefs.HeaderFields);
            scope.tableGrid.columnDefs.unshift({ colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 60, menuTabs: [] });
                
            scope.tableGridDiv = document.querySelector('#table-grid');
            new agGrid.Grid(scope.tableGridDiv, scope.tableGrid);

        });

        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openDataModal(param.data);
            });
            div.appendChild(editBtn);

            return div;
        };


        scope.tableGrid = {
            columnDefs: [],
            rowData: null,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                scope.tableGrid.selectedItems = scope.tableGrid.api.getSelectedRows();
                scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
            },
            selectedItems: [],
            defaultColDef: {
                editable: false,
                sortable: true,
                resizable: true,
            },
        }

        scope.delete = function(){
            if(scope.tableGrid.selectedItems.length == 1 && confirm("Are you sure you want to delete the selected row? This is irreversible."))
                var deleted = DatasetService.deleteDataTableRow(scope.dataset, scope.tableGrid.selectedItems[0]);
                deleted.$promise.then(function(){
                    scope.tabledata.forEach(function(data,index){ 
                        if(scope.tableGrid.selectedItems[0].Id == data.Id)
                            scope.tabledata.splice(index,1);
                    })
                    scope.tableGrid.api.setRowData(scope.tabledata);
                    scope.tableGrid.selectedItems.length = 0;
                });
        }

        scope.openDataModal = function (params) {

            scope.data_modal = (params) ? params : {};

            var modalInstance = $modal.open({
                templateUrl: 'app/core/datasets/components/dataset-table/templates/edit-data-modal.html',
                controller: 'TableDataModal',
                scope: scope,
                backdrop: "static",
                keyboard: false
            }).result.then(function(saved){
                saved = saved[0]; //get the first row
                if(!scope.data_modal.hasOwnProperty('Id')){
                    //console.log("added to tabledata");
                    scope.tabledata.push(saved);
                }
                else
                {
                    scope.tabledata.forEach(function(data){
                        if(data.Id == saved.Id)
                        {
                            angular.extend(data, saved);
                        }
                    });
                    //console.log("updated tabledata");
                }
                //console.dir(saved);

                scope.tableGrid.api.setRowData(scope.tabledata);
            });
        }

    }
];