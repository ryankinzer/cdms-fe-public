
var admin_edit_dataset_fields = ['$scope', '$uibModal', '$timeout', '$routeParams', 'DatasetService', 'CommonService','ProjectService','AdminService',
    function ($scope, $modal, $timeout, $routeParams, DatasetService, CommonService, ProjectService, AdminService ){

        $scope.OnTab = "Fields";

		$scope.dataset = DatasetService.getDataset($routeParams.Id);
		$scope.FieldLookup = {};

        $scope.MasterFields = [];
        $scope.allFields = [];

		//$scope.Sources = CommonService.getSources();
		//$scope.Instruments = ProjectService.getInstruments();

      
        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openEditModal(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Remove';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.removeField(param.data);
            });
            div.appendChild(delBtn);

            return div;
        };

        $scope.fieldGridOptions = {
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            rowSelection: 'multiple',
            //getRowHeight: function () { return 120; },
            //onFilterModified: function () {
            //    scope.galleryGridOptions.api.deselectAll();
            //},
            //selectedItems: [],
            columnDefs:
            [
                { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 120, menuTabs: [] },
                { field: 'FieldRoleId', headerName: 'Field Role', width: 120, menuTabs: ['filterMenuTab'] },
                { field: 'Label', headerName: 'Label', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'OrderIndex', headerName: 'Order Index', sort:'asc', width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Validation', headerName: 'Local Validation', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Rule', headerName: 'Local Rule', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'DataType', headerName: 'DataType', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'ControlType', headerName: 'Control Type', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.ControlType', headerName: 'Master Control Type', width: 250, menuTabs: ['filterMenuTab'],  },
                { field: 'Field.Name', headerName: 'Master Name', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Description', headerName: 'Master Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Units', headerName: 'Master Units', width: 200, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.DbColumnName', headerName: 'DbColumnName', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.PossibleValues', headerName: 'Master Possible Values', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.DataSource', headerName: 'Master Data Source', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Validation', headerName: 'Master Validation', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Rule', headerName: 'Master Rule', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
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
                $scope.fieldGridOptions.api.setRowData($scope.dataset.Fields);
                //$scope.galleryGridOptions.api.sizeColumnsToFit();

                
        };


		$scope.dataset.$promise.then( function(){

            var promise = AdminService.getMasterFields($scope.dataset.Datastore.Id);

            promise.$promise.then(function (data) {
                $scope.allFields = promise;
    
                //also add in the activity system fields
                var systemFields = AdminService.getMasterFields(DATASTORE_ACTIVITYSYSTEMFIELDS);
                systemFields.$promise.then(function () {
                    systemFields.forEach(function (systemfield) { 
                        $scope.allFields.push(systemfield);
                    });

                    $scope.populateAddFieldDropdown();
                });
            });

            $scope.activateGrid();


		});


		$scope.removeField = function(params)
		{
			
            var removed_field = AdminService.removeField($scope.dataset.Id, params.FieldId);

            removed_field.$promise.then(function () { 
                $scope.dataset.Fields.forEach(function (field_removed,index) {
                    console.dir(field_removed);
                    if (field_removed.FieldId == params.FieldId) {
                        console.dir("found field to remove : " + field_removed.FieldId);
                        $scope.dataset.Fields.splice(index, 1);
                    }
                });

                $scope.populateAddFieldDropdown();
                $scope.fieldGridOptions.api.setRowData($scope.dataset.Fields);
            });

            

		}

		$scope.addMasterField = function()
		{
			// Note:  Given a list with zero-based index (0, 1, 2, 3, etc.), like we have here.
			// With angular, when you select the first item in a list, it often (always?) shows blank (null).
			// The problem does not present itself for items 1 and following.
			// This problem is a known issue (see this article:  http://stackoverflow.com/questions/12654631/why-does-angularjs-include-an-empty-option-in-select).
			// To avoid this problem, we access the first item (0), using index 0.
			if ($scope.newField === null)
				$scope.newField = $scope.MasterFields[0].Id;
			
			console.log("$scope.newField  = " + $scope.newField);
            console.dir($scope.newField);

			var result = AdminService.addMasterFieldToDataset($scope.dataset.Id, $scope.newField);
    
            result.$promise.then(function () { 
                console.dir(result);
                $scope.dataset.Fields.push(result);
                $scope.populateAddFieldDropdown();
                $scope.fieldGridOptions.api.setRowData($scope.dataset.Fields);
                //$scope.newField = $scope.MasterFields[0].Id;

                //$("select2Options").val('').change();

            });
		};

        $scope.openEditModal = function (a_selection, a_callback) {
            $scope.SaveMessage = null;
            $scope.field_to_edit = a_selection;
            $scope.callback = a_callback;
            var modalInstance = $modal.open({
                templateUrl: 'app/core/admin/components/admin-page/templates/modal-edit-dataset-field.html',
                controller: 'ModalEditDatasetFieldCtrl',
                scope: $scope, //very important to pass the scope along...
            }).result.then(function (saved_field) { 
                //replace that field in the grid with the one we got back
                $scope.dataset.Fields.forEach(function (existing_field,index) {
                    if (existing_field.FieldId == saved_field.FieldId) {
                        console.dir("found field to replace : " + existing_field.FieldId);
                        $scope.dataset.Fields[index] = saved_field;
                    }
                });

                $scope.populateAddFieldDropdown();
                $scope.fieldGridOptions.api.setRowData($scope.dataset.Fields);
                $scope.SaveMessage = "Success.";
            });
        };

        $scope.populateAddFieldDropdown = function () {
            $scope.MasterFields.length = 0;
            //make sure incoming master fields aren't already in the dataset fields
            $scope.allFields.forEach(function (field, index) {
                if (!getByField($scope.dataset.Fields, field.Id, 'FieldId')) {
                    $scope.MasterFields.push(field);
                }
            });
        };
	}
];