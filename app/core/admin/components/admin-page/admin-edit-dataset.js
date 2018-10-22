
var admin_edit_dataset = ['$scope', '$uibModal', '$timeout', '$routeParams', 'DatasetService', 'CommonService','ProjectService','AdminService',
    function ($scope, $modal, $timeout, $routeParams, DatasetService, CommonService, ProjectService, AdminService ){

        $scope.OnTab = "Fields";

		$scope.dataset = DatasetService.getDataset($routeParams.Id);
		$scope.FieldLookup = {};
        //$scope.SelectedField = null;
        $scope.saveResults = {};

        $scope.MasterFields = [];
        $scope.allFields = [];

		//$scope.Sources = CommonService.getSources();
		//$scope.Instruments = ProjectService.getInstruments();

      
        var EditLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openEditFieldModal(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode("|"));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Remove';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeField(param.data);
            });
            div.appendChild(delBtn);

            return div;
        };

        $scope.fieldGridOptions = {
            enableSorting: true,
            enableFilter: true,
            enableColResize: true,
            rowSelection: 'multiple',
            //getRowHeight: function () { return 120; },
            //onFilterModified: function () {
            //    scope.galleryGridOptions.api.deselectAll();
            //},
            //selectedItems: [],
            columnDefs:
            [
                { colId: 'EditLinks', cellRenderer: EditLinksTemplate, width: 120, menuTabs: [] },
                { field: 'Label', headerName: 'Label', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'OrderIndex', headerName: 'Order Index', sort:'asc', width: 120, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Validation', headerName: 'Local Validation', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Rule', headerName: 'Local Rule', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Name', headerName: 'Name', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Description', headerName: 'Description', cellStyle: { 'white-space': 'normal' }, width: 300, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Units', headerName: 'Units', width: 200, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.DbColumnName', headerName: 'DbColumnName', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.DataType', headerName: 'DataType', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.ControlType', headerName: 'Control Type', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.PossibleValues', headerName: 'Possible Values', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.DataSource', headerName: 'Data Source', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.FieldRoleId', headerName: 'Field Role', width: 100, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Validation', headerName: 'Master Validation', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
                { field: 'Field.Rule', headerName: 'Master Rule', width: 250, menuTabs: ['filterMenuTab'], filter: 'text' },
            ]
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
                $scope.populateAddFieldDropdown();
            });

            $scope.activateGrid();


		});

        $scope.logStatus = function () {
            console.log('-----------------');
            console.dir($scope.QAStatusList);
            console.dir($scope.dataset.DefaultActivityQAStatusId);
            console.log(typeof $scope.dataset.DefaultActivityQAStatusId);
            console.dir($scope.dataset);
        };

		$scope.$watch('saveResults.success', function(){
			if (!$scope.saveResults.success)
				return;

            console.log("The result of saveResults: " + $scope.saveResults.success);
            console.log(" - so now we'll reload the dataset: " + $routeParams.Id);
			
			DatasetService.clearDataset();
			$scope.dataset = DatasetService.getDataset($routeParams.Id); //reload
			$scope.SelectedField = null;

		},true);

		$scope.removeField = function(params)
		{
			
			//$scope.saveResults = {};
            //AdminService.removeField($scope.dataset.Id, $scope.SelectedField.FieldId, $scope.saveResults);

            //if removed
            $scope.dataset.Fields.forEach(function (field_removed,index) {
                if (field_removed.FieldId == params.node.FieldId) {
                    console.dir("found field to remove : " + field_removed.FieldId);
                    $scope.dataset.Fields.splice(index, 1);
                    console.dir($scope.dataset.Fields);
                }
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
                $scope.newField = $scope.MasterFields[0].Id;
            });
		};
/*
		$scope.saveField = function()
		{
			console.log("Inside admin_edit_dataset, saveField...");
			
			$scope.saveResults = {};
			AdminService.saveDatasetField($scope.SelectedField, $scope.saveResults);
        };

        $scope.saveConfig = function () {
            $scope.dataset.Config = $scope.dataset.ConfigString;
            var promise = DatasetService.saveDataset($scope.dataset );

            promise.$promise.then(function () {
                console.dir(promise);
                $scope.dataset = DatasetService.getDataset(promise.Id);
                $scope.success_message = "Save successful.";
            });
        };

		$scope.selectField = function(field){
			$scope.SelectedField = field;
        };

        $scope.parseConfigString = function () {
            try {
                var ConfigObject = angular.fromJson($scope.dataset.ConfigString);
                if (ConfigObject)
                    $scope.ConfigParse = "Parse successful.";
            } catch (exception) {
                console.dir(exception);
                $scope.ConfigParse = exception.message;
            }
        }
*/
        $scope.populateAddFieldDropdown = function () {
            $scope.MasterFields.length = 0;
            //make sure incoming master fields aren't already in the dataset fields
            $scope.allFields.forEach(function (field, index) {
                if (!getByField($scope.dataset.Fields, field.Id, 'FieldId')) {
                    $scope.MasterFields.push(field);
                    //console.dir(field);
                }
            });
        };
	}
];