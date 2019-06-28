var modal_feedback = ['$scope', '$uibModal', '$rootScope','CommonService',
    function ($scope, $modal, $rootScope, CommonService) {

        $scope.feedback = {
            SubmitterName: $scope.Profile.Fullname,
            SubmitDate: moment().format('L')
        };      

        $scope.save = function () { 
            var saved_feedback = CommonService.saveFeedback($scope.feedback);
            saved_feedback.$promise.then(function () { 
                $scope.successMessage = "Your feedback is recorded (issue #: " + saved_feedback.Id + ")";

                $scope.feedback = {
                    SubmitterName: $scope.Profile.Fullname,
                    SubmitDate: moment().format('L')
                };  

            });
        };

        $scope.cancel = function(){
            $modalInstance.dismiss();
        };

  }
];
