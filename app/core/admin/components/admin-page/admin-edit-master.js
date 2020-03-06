
var admin_edit_master = ['$scope', '$timeout', '$uibModal', 'DatasetService', 'AdminService', '$routeParams',
	function($scope, $timeout, $modal, DatasetService, AdminService, $routeParams){

		$scope.datastore = DatasetService.getDatastore($routeParams.Id);
		

        $scope.datastore.$promise.then(function () { 
			$scope.datastore.Fields = AdminService.getMasterFields($scope.datastore.Id); 
            $scope.datastore.Fields.$promise.then(function () {
                $scope.activateGrid();
            });
        });

		
      
        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openEditModal(param.data);
            });
            div.appendChild(editBtn);
            
            return div;
        };

        $scope.fieldGridOptions = {
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            rowSelection: 'multiple',

            columnDefs:
            [
                { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 120, menuTabs: [] },
                { field: 'Name', headerName: 'Name', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Units', headerName: 'Units', width: 200, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DbColumnName', headerName: 'DbColumnName', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DataType', headerName: 'DataType', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'ControlType', headerName: 'Control Type', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'PossibleValues', headerName: 'Possible Values', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DataSource', headerName: 'Data Source', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'FieldRoleId', headerName: 'Field Role', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Validation', headerName: 'Master Validation', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Rule', headerName: 'Master Rule', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
            ],
            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };


        $scope.activateGrid = function () {

                var ag_grid_div = document.querySelector('#fields-grid');    //get the container id...

                if (typeof $scope.ag_grid_div === 'undefined')
                    $scope.ag_grid_div = new agGrid.Grid(ag_grid_div, $scope.fieldGridOptions); //bind the grid to it.

                $scope.fieldGridOptions.api.showLoadingOverlay(); //show loading...
                $scope.fieldGridOptions.api.setRowData($scope.datastore.Fields);

                
        };

        $scope.openEditModal = function (a_selection) {
            $scope.SaveMessage = null;
            $scope.field_to_edit = a_selection;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-edit-master-field.html',
                controller: 'ModalEditMasterFieldCtrl',
                scope: $scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_field) { 
                //replace that field in the grid with the one we got back
                $scope.datastore.Fields.forEach(function (existing_field,index) {
                    if (existing_field.Id == saved_field.Id) {
                        console.dir("found field to replace : " + existing_field.FieldId);
                        $scope.datastore.Fields[index] = saved_field;
                    }
                });

                $scope.fieldGridOptions.api.setRowData($scope.datastore.Fields);
                $scope.SaveMessage = "Success.";
            });
        };

        $scope.createMasterField = function(){
            $scope.SaveMessage = null;
            $scope.field_to_edit = {};
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-edit-master-field.html',
                controller: 'ModalEditMasterFieldCtrl',
                scope: $scope, 
                backdrop: "static",
                keyboard: false
            }).result.then(function (saved_field) { 
                $scope.datastore.Fields.push(saved_field);
                $scope.fieldGridOptions.api.setRowData($scope.datastore.Fields);
                $scope.SaveMessage = "Success.";
            });
        }
		
	}
];