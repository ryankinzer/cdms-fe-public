var covid_list = ['$scope', '$route', '$routeParams', '$uibModal', '$location', '$window', '$rootScope', 'CovidService', 'GridService', 'DatasetService','CommonService',
    function ($scope, $route, $routeParams, $modal, $location, $window, $rootScope, CovidService, GridService, DatasetService, CommonService) {

        $scope.employees = CovidService.getMyEmployees();
        $scope.work = CovidService.getMyEmployeesWork();

        //note: they asked to show all dates through 4/30 instead of just through today... hence the redefinition of "today" :)
        var today_text = moment(new Date('05/31/2020')).format('M/D/YY');
        var today = moment(new Date('05/31/2020'));
        var begin = moment(new Date('03/15/2020'));
        $scope.lookup = {};
        $scope.save = {};
        $scope.loaded = false;
        
        $scope.noCopyCells = ['Name','Program','Status','Access','IsHighRisk','IsUnique','Notes']

        $scope.employees.$promise.then(function () {
            $scope.work.$promise.then(function(){
                $scope.activateGrid();
                $scope.empGrid.api.setRowData($scope.employees);
                $scope.loaded = true;
            });
        });
        

        var empColumnDefs = [
            { headerName: "Staff Name", field: "Name", width: 160, pinned: 'left', editable: false, menuTabs: ['filterMenuTab'], },
            { headerName: "Program/Dept", field: "Program", width: 130, editable: false, menuTabs: ['filterMenuTab'], },
            { headerName: "Status", field: "Status", width: 120,  
                cellEditor: 'agSelectCellEditor', 
                cellEditorParams: {
                    values: ['','Essential','Non-essential']
                },
                menuTabs: ['filterMenuTab'],
            },
            { headerName: "Access", field: "Access", width: 120,  
                cellEditor: 'agSelectCellEditor', 
                cellEditorParams: {
                    values: ['','Home internet','Cell hotspot', 'None']
                },
                menuTabs: ['filterMenuTab'],
            },
            { headerName: "High Risk?", field: "IsHighRisk", width: 100, 
                cellEditor: 'agSelectCellEditor', 
                cellEditorParams: {
                    values: ['','Yes','No']
                },
                menuTabs: ['filterMenuTab'],
            },
            { headerName: "Unique?", field: "IsUnique", width: 100, 
                cellEditor: 'agSelectCellEditor', 
                cellEditorParams: {
                    values: ['','Yes','No']
                },
                menuTabs: ['filterMenuTab'],
            },
            { headerName: "Notes", field: "Notes", width: 200, menuTabs: [], },
            
        ]; 

        $scope.isCopyableCell = function(){
            return (!$scope.noCopyCells.contains($scope.selectedCell.column.colId));
        }

        $scope.copyCellRight = function(){
            //console.dir($scope.selectedCell)
            var nextDay = moment(new Date($scope.selectedCell.column.colId));
            while (!today.isSame(nextDay, 'd')) {
                nextDay = nextDay.add(1, 'd')
                nextDayText = nextDay.format('M/D/YY')
                $scope.lookup[$scope.selectedCell.data.Id][nextDayText] = $scope.selectedCell.value;
            }
            $scope.empGrid.api.setRowData($scope.employees);
            $scope.lookup[$scope.selectedCell.data.Id].updated = true;
        }

        $scope.copyColumnRight = function(){
            //console.dir($scope.selectedCell)

            var nextDay = moment(new Date($scope.selectedCell.column.colId));

            if(nextDay.format('M/D/YY') === today_text)
            {
                alert("Can't copy today's values to future column.")
                return;
            }

            nextDay = nextDay.add(1,'d'); 
            while (nextDay.day() === 0 || nextDay.day() === 6) { //skip the weekend days
                nextDay = nextDay.add(1,'d');     
            }

            nextDayField = nextDay.format('M/D/YY')

            $scope.employees.forEach(function(employee){
                var valToCopy = employee[$scope.selectedCell.column.colId];
                employee[nextDayField] = valToCopy;
                employee.updated = true;
            });

            $scope.empGrid.api.setRowData($scope.employees);

            /*
            var nextDay = moment(new Date($scope.selectedCell.column.colId));
            while (!today.isSame(nextDay, 'd')) {
                nextDay = nextDay.add(1, 'd')
                nextDayText = nextDay.format('M/D/YY')
                $scope.lookup[$scope.selectedCell.data.Id][nextDayText] = $scope.selectedCell.value;
            }
            $scope.empGrid.api.setRowData($scope.employees);
            */
        }

        $scope.empGrid = {
            columnDefs: empColumnDefs,
            rowData: [],
            enableSorting: true,
            enableFilter: true,
            rowSelection: 'single',
            defaultColDef: {
                editable: true,
                sortable: true,
                resizable: true
            },
            selectedItem: null,
            selectedCell: null,
            selectedNode: null,
            onCellEditingStopped: function(params){
                $scope.lookup[params.data.Id].updated = true;
                $scope.selectedCell = params;
            },
            onSelectionChanged: function (params) {
                //console.dir(params)
                $scope.empGrid.selectedItem = $scope.row = angular.copy($scope.empGrid.api.getSelectedRows()[0]);
                $scope.empGrid.selectedNode = $scope.empGrid.api.getSelectedNodes()[0];
                $scope.$apply();
            },
            onCellClicked: function(event){
                //console.dir(event)
                $scope.selectedCell = event;
                $scope.$apply();
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
                        values: ['','Work from home', 'Admin leave','In office','Sick leave','Annual leave',"Not Scheduled"]
                    },
                    menuTabs: ['filterMenuTab'],
                });

            }

            //populate the workdates
            $scope.employees.forEach(function(employee){
                /*
                // this sets our supervisors to an array, though not currently necessary since we neither display nor save
                try{
                    employee.SupervisorUsername = (employee.SupervisorUsername) ? angular.fromJson(employee.SupervisorUsername) : [];
                    
                }catch(e){
                    var supervisors = [];
                    supervisors.push(employee.SupervisorUsername);
                    employee.SupervisorUsername = supervisors;
                }
                */
                $scope.lookup[employee.Id] = employee;
            })

            $scope.work.forEach(function(item){
                var workdate = moment(item.WorkDate).format('M/D/YY');
                if($scope.lookup[item.EmployeeId])
                    $scope.lookup[item.EmployeeId][workdate] = item.WorkStatus
            })
 
            //activate the grid
            if (!$scope.empGridDiv) {
                $scope.empGridDiv = document.querySelector('#employee-grid');
                new agGrid.Grid($scope.empGridDiv, $scope.empGrid);
            }

        }

        $scope.saveRecords = function(){
            $scope.save.isSaving = true;
            $scope.save.hasSuccess = false;
            $scope.save.hasError = false;

            var updatedEmployees = [];

            //only send changed records
            $scope.employees.forEach(function(employee){
                if(employee.updated){
                    delete employee.updated;
                    delete employee.EnrollmentStatus;
                    //employee.SupervisorUsername = angular.toJson(employee.SupervisorUsername); //if we ever want to save them from the FE
                    updatedEmployees.push(employee);
                }
            })

            saving = CovidService.saveEmployees(updatedEmployees);
            saving.$promise.then(function(){
                $scope.save.isSaving = false;
                $scope.save.hasSuccess = true;
                $scope.save.hasError = false;
                $scope.save.message = "Success.";
            }, function(){
                $scope.save.isSaving = false;
                $scope.save.hasSuccess = false;
                $scope.save.hasError = true;
                $scope.save.message = "There was an error.";
            })
        }

        $scope.cancel = function(){
            if(!confirm("Are you sure you want to reload the records?")) {
                return;
            }

            $scope.lookup = {}
            $scope.save = {}
            $scope.loaded = false;

            $scope.employees = CovidService.getMyEmployees();
            $scope.work = CovidService.getMyEmployeesWork();

            $scope.employees.$promise.then(function(){
                $scope.work.$promise.then(function(){

                    //populate the workdates
                    $scope.employees.forEach(function(employee){
                        $scope.lookup[employee.Id] = employee;
                    })

                    $scope.work.forEach(function(item){
                        var workdate = moment(item.WorkDate).format('M/D/YY');
                        if($scope.lookup[item.EmployeeId])
                            $scope.lookup[item.EmployeeId][workdate] = item.WorkStatus
                    })

                    $scope.empGrid.api.setRowData($scope.employees);
                    $scope.loaded = true;

                });
            });

        };

        $scope.addEmployee = function(){
            alert("To add employees, email a spreadsheet to kenburcham@ctuir.org with:  Name, Title, Email, Department, Program, Supervisor(s), Department Supervisor");
        }

        $scope.removeEmployee = function(){
            if(!confirm("Are you sure you want to remove this employee? NOTE: You should only remove invalid staff, not misassigned staff. If staff is misassigned to you, please contact kenburcham@ctuir.org for reassignment.")){
                return;
            }

            var removed = CovidService.removeEmployee($scope.row.Id);

            removed.$promise.then(function(){
                $scope.employees.forEach(function (file, index) {
                    if (file.Id == $scope.row.Id) {
                        $scope.employees.splice(index, 1);
                        $scope.empGrid.api.setRowData($scope.employees);
                        delete $scope.lookup[file.Id]
                    }
                });
            }, function(){
                alert("There was a problem removing that employee.");
            });

        }


}];
