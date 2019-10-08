//modal to edit dataset field
var modal_admin_new_datastore = ['$scope', '$uibModal','$uibModalInstance','AdminService',

    function ($scope, $modal, $modalInstance, AdminService) {

        $scope.datastore = {};
        $scope.to_generate = "";

        $scope.save = function () {
			var saved_datastore = AdminService.saveNewDatastore($scope.datastore);
            saved_datastore.$promise.then(function () { 
                $modalInstance.close(saved_datastore);
            }, function (error) {
                $scope.SaveMessage = "Error: " + error.data.ExceptionMessage;
            });
            
        };

        $scope.checkTablePrefix = function(){
            $scope.datastore.TablePrefix = $scope.datastore.TablePrefix.replace(" ","");
            $scope.datastore.TablePrefix = $scope.datastore.TablePrefix.charAt(0).toUpperCase() + $scope.datastore.TablePrefix.slice(1)
            if($scope.datastore.TableType == 'Single')
                $scope.to_generate = $scope.datastore.TablePrefix;
            else
                $scope.to_generate = $scope.datastore.TablePrefix + "_Header + "+$scope.datastore.TablePrefix + "_Detail";
            
        }

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
