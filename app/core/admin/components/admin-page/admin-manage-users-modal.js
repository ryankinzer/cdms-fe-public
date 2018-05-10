
var modal_manage_user = ['$scope', '$modalInstance', 'CommonService',
    function (scope, $modalInstance, CommonService) {

        scope.UserStatuses = [ 
            { 'Id': 0, 'Name': 'Active' },
            { 'Id': 1, 'Name': 'Inactive' },
        ];

        if (scope.user) {
            scope.headingMessage = "Edit User: " + scope.user.Fullname;
            if (scope.user.Inactive == null)
                scope.user.Inactive = 0;
         
        }
        else {
            scope.headingMessage = "Create new user";
            scope.user = {Inactive: 0};
        }

        scope.hidePassword = function () {
            if (scope.user.Password) {
                $('input#user-password').hide();
                $('input#user-password-hidden').show();
            }
        }

        scope.showPassword = function () {
            if (scope.user.Password) {
                $('input#user-password-hidden').hide();
                $('input#user-password').show().focus();
            }
        }

        scope.save = function () {
            scope.user.Password = btoa(scope.user.Password); //encodes
            var promise = CommonService.saveUser(scope.user);

            promise.$promise.then(function () {
                console.log("done and success!");
                $modalInstance.dismiss();
            });
            

        };

        scope.cancel = function () {
            delete scope.user.Password;
            
            $modalInstance.dismiss();
        };

    }
];
