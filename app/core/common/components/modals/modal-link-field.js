
var modal_link_field = ['$scope', '$modalInstance', '$rootScope',
    function ($scope, $modalInstance, $rootScope) {
        console.log("Inside modals-controller.js, LinkModalCtrl...");
        //console.log("$scope is next...");
        //console.dir($scope);

        if (typeof $scope.onRow !== 'undefined')
            $scope.onRow.errors = [];

        $scope.foundDuplicate = false;
        //note: link selected for upload are managed by onLinkSelect from parent scope, in the following place:
        // ModalAddHabitatItemCtrl

        $scope.makeNewLink = function () { $scope.newLink = { Name: "", Link: "" } };
        $scope.makeNewLink();

        console.log("$scope.link_field.DbColumnName = " + $scope.link_field.DbColumnName);
        //$scope.currentLinks = $scope.link_field[$scope.link_field.DbColumnName];
        $scope.currentLinks = $scope.link_row[$scope.link_field.DbColumnName];
        console.log("$scope.currentLinks (before check) is next...");
        console.dir($scope.currentLinks);
        if ($scope.currentLinks)
            $scope.currentLinks = angular.fromJson($scope.currentLinks);
        else
            $scope.currentLinks = [];

        console.log("$scope.currentLinks (after check) is next...");
        console.dir($scope.currentLinks);

        $rootScope.currentLinks = angular.copy($scope.currentLinks);
        console.log("$rootScope.currentLinks is next...");
        console.dir($rootScope.currentLinks);

        $scope.removeLink = function (link) {
            console.log("Inside FileModalCtrl, removeLink...");
            console.log("link is next...");
            console.dir(link);

            console.log("$rootScope.currentLinks is next...");
            console.dir($rootScope.currentLinks);
            angular.forEach($scope.currentLinks, function (existing_link, key) {
                if (existing_link.Link == link.Link)
                    $scope.currentLinks.splice(key, 1);
            });
            angular.forEach($rootScope.currentLinks, function (existing_link, key) {
                console.log("existing_link.Link = " + existing_link.Link + ", link.Link = " + link.Link);
                var existing_linkLength = existing_link.Link.length;
                var linkLength = link.Link.length;
                console.log("existing_linkLength = " + existing_linkLength + ", linkLength = " + linkLength);

                console.log("Check: " + existing_link.Name.indexOf(link.Link));
                //if(existing_link.Name == link.Link)
                if (existing_linkLength === linkLength) {
                    console.log("Lengths match...");
                    if (existing_link.Link.indexOf(link.Link) !== -1) {
                        console.log("Link matches...");
                        if ($scope.subprojectType === "Habitat") {
                            console.log("Habitat file...");
                            //kb - 11/1: the following function doesn't actually exist anywhere...
                            //DatastoreService.deleteHabitatItemLink($scope.projectId, $scope.subprojectId, $scope.hi_row.Id, file);
                        }

                        $scope.currentLinks.splice(key, 1);
                    }
                }
            });
        }

        $scope.addLink = function () {
            $scope.currentLinks.push($scope.newLink);
            console.log("$scope.currentLinks is next...");
            console.dir($scope.currentLinks);
            $scope.makeNewLink();
        }

        $scope.save = function () {
            console.log("Inside modals-controller, LinkModalCtrl, save...");
            console.log("Adding link name(s) to the list.");
            //console.log("$scope is next...");
            //console.dir($scope);
            $rootScope.viewSubproject = $scope.viewSubproject; // Add this to the $rootScope, so that the filters can see it.
            //var errors = [];

            //copy back to the actual row field
            $scope.link_row[$scope.link_field.DbColumnName] = angular.toJson($scope.currentLinks);
            console.log("$scope.link_row is next...");
            console.dir($scope.link_row);
            $modalInstance.dismiss();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }
];
