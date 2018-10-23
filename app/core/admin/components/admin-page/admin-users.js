
var admin_users = ['$scope', '$modal', 'CommonService',
    function (scope, $modal, CommonService) {

        if (!scope.Profile.isAdmin())
            angular.rootScope.go("/unauthorized");
        
        scope.Users = CommonService.getAllUsers();
        scope.Departments = CommonService.getDepartments();

        scope.openManageUserModal = function (user) {

            if (user)
                scope.user = user;
            else
                scope.user = null;

            var modalInstance = $modal.open({
                templateUrl: 'app/core/common/components/modals/templates/modal-manage-user.html',
                controller: 'ModalManageUserCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        scope.getStatusText = function(inactive_status){
            return (inactive_status) ? "Inactive" : "Active"; //1=inactive
        }

    }

];