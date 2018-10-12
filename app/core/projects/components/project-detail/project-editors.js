/*
*   This page loads the project editors
*/

var project_editors = ['$scope', '$routeParams','SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'PreferencesService',
    '$rootScope', '$uibModal', '$sce', '$window', '$http',
    'ServiceUtilities', 'ConvertStatus', '$location', '$anchorScroll',
    function (scope, routeParams, SubprojectService, ProjectService, DatasetService, CommonService, PreferencesService, $rootScope, $modal, $sce, $window, $http,
        ServiceUtilities, ConvertStatus, $location, $anchorScroll) {

        scope.OnTab = "Editors";

        scope.AuthorizedToViewProject = true;

		scope.currentUserId = $rootScope.Profile.Id;
        scope.project = ProjectService.getProject(routeParams.Id);

        scope.UserIsAdmin = false;
        scope.UserIsOwner = false;
        scope.UserIsEditor = false;

        scope.project.$promise.then(function () {
            
            scope.editors = scope.project.Editors;
            scope.users = CommonService.getUsers();

            if (scope.currentUserId === scope.project.OwnerId)
                scope.UserIsOwner = true;

            angular.forEach(scope.project.Editors, function (editor) {
                //console.log("scope.currentUserId = " + scope.currentUserId + ", editor.Id = " + editor.Id)
                if (editor.Id === scope.currentUserId)
                {
                    //console.log("user is an editor...");
                    scope.UserIsEditor = true;
                }
            });

            scope.users.$promise.then(function () { 

                scope.UserIsAdmin = false;
                angular.forEach(scope.users, function (user) {
                    //console.log("scope.currentUserId = " + scope.currentUserId + ", user.Id = " + user.Id); // + ", " + user.Roles.indexOf("Admin"));
                    if ((user.Id === scope.currentUserId) && (user.Roles.indexOf("Admin") > -1))
                    {
                        console.log("user is an admin...");
                        scope.UserIsAdmin = true;
                    }
                });

            });

        });

		

		 

        //remove this editor from the users dropdown.
        scope.filterUsers = function()
        {
            console.log("filterusers starting with " + scope.users.length);

            var newusers = [];

            for (var a = 0; a < scope.users.length; a++) {
                var user = scope.users[a];
                var filterOut = false;

                for (var i = 0; i < scope.editors.length; i++) {
                    //is this user an editor already?  if so leave them off the list.
                    if(scope.editors[i].Id == user.Id)
                    {
                        filterOut = true;
                        break;
                    }
                }

                if(!filterOut)
                    newusers.push(user);


            };

            console.log("set a new group: " + newusers.length);
            scope.users = newusers.sort(orderUserByAlpha);

        }

        scope.select2Options = {
            allowClear:true
        };

        scope.selectedUser = null;

        scope.addEditor = function(){
            console.log("Add Editor.");
            for (var i = 0; i < scope.users.length; i++) {
                var user = scope.users[i];

                if(user.Id == scope.selectedUser)
                {
                    scope.editors.push(user);
                    scope.users.splice(i,1);
                    scope.selectedUser = null;
                    break;
                }
            };
        };

        scope.removeEditor = function(index)
        {
            scope.users.push(scope.editors.splice(index,1)[0]);
            scope.users.sort(orderUserByAlpha);
        };

        scope.saveEditors = function()
        {
            scope.saveResults = {};
            ProjectService.saveEditors(scope.currentUserId, scope.project.Id, scope.editors, scope.saveResults);
        };
		 	  
	
        scope.cancel = function()
        {
           // scope.users =
        };


        scope.canEdit = function (project) {
            return $rootScope.Profile.canEdit(project);
        };
        
    }

];






