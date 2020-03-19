var covid_list = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'CovidService', 'GridService', 'DatasetService','CommonService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, CovidService, GridService, DatasetService, CommonService) {

        $scope.employees = CovidService.getMyEmployees();
        $scope.work = CovidService.getMyEmployeesWork();

        var today_text = moment(new Date()).format('M/D/YY');
        var today = moment();
        var begin = moment(new Date('03/02/2020'));
        $scope.lookup = {};
        

        $scope.employees.$promise.then(function () {
            $scope.work.$promise.then(function(){
                $scope.activateGrid();
                $scope.empGrid.api.setRowData($scope.employees);
            });
        });
        

        var empColumnDefs = [
            { headerName: "Name", field: "Name", width: 160, pinned: 'left', editable: false },
            { headerName: "Program", field: "Program", width: 150, pinned: 'left',  editable: false },
            { headerName: "Status", field: "Status", width: 160, pinned: 'left', 
                cellEditor: 'agSelectCellEditor', 
                cellEditorParams: {
                    values: ['Essential','Non-essential', 'High Risk']
                }
            },
            { headerName: "Access", field: "Access", width: 160, pinned: 'left', 
                cellEditor: 'agSelectCellEditor', 
                cellEditorParams: {
                    values: ['Home internet','Cell hotspot', 'None']
                }
            },
        ]; 

        $scope.copyRight = function(){
            //console.dir($scope.selectedCell)
            var nextDay = moment(new Date($scope.selectedCell.column.colId));
            while (!today.isSame(nextDay, 'd')) {
                nextDay = nextDay.add(1, 'd')
                nextDayText = nextDay.format('M/D/YY')
                $scope.lookup[$scope.selectedCell.data.Id][nextDayText] = $scope.selectedCell.value;
            }
            $scope.empGrid.api.setRowData($scope.employees);
        }

        $scope.empGrid = {
            columnDefs: empColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            rowSelection: 'single',
            defaultColDef: {
                editable: true
            },
            selectedItem: null,
            selectedCell: null,
            selectedNode: null,
            onSelectionChanged: function (params) {
                //console.dir(params)
                $scope.empGrid.selectedItem = $scope.row = angular.copy($scope.empGrid.api.getSelectedRows()[0]);
                $scope.empGrid.selectedNode = $scope.empGrid.api.getSelectedNodes()[0];
                $scope.$apply();
            },
            onCellClicked: function(event){
                //console.dir(event)
                $scope.selectedCell = event;
            }
        }

        //activate the grid once we have the employees back.
        $scope.activateGrid = function(){

            //setup the day columns
            var nextDay = moment(begin);
            while (!today.isSame(nextDay, 'd')) {
                nextDay = nextDay.add(1, 'd')
                nextDayText = nextDay.format('M/D/YY')

                if(nextDay.day() === 0 || nextDay.day() === 6)
                    continue

                //add column to grid
                empColumnDefs.push({
                    headerName: nextDayText,
                    field: nextDayText,
                    width: 160,
                    cellEditor: 'agSelectCellEditor', 
                    cellEditorParams: {
                        values: ['Work from home', 'Admin leave','In office','Sick leave','Annual leave']
                    } 
                });

            }

            //populate the workdates
            $scope.employees.forEach(function(employee){
                $scope.lookup[employee.Id] = employee;
            })

            $scope.work.forEach(function(item){
                var workdate = moment(item.WorkDate).format('M/D/YY');
                $scope.lookup[item.EmployeeId][workdate] = item.WorkStatus
            })

            //activate the grid
            if (!$scope.empGridDiv) {
                $scope.empGridDiv = document.querySelector('#employee-grid');
                new agGrid.Grid($scope.empGridDiv, $scope.empGrid);
            }

        }

        $scope.save = function(){
            saving = CovidService.saveEmployees($scope.employees);
        }


}];