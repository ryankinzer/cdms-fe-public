common_module.directive('showtab',
        function () {
            return {
                link: function (scope, element, attrs) {
                    element.click(function (e) {
                        e.preventDefault();
                        $(element).tab('show');
                    });
                }
            };
        });


common_module.directive('ngBlur', function () {
        return function( scope, elem, attrs ) {
            elem.bind('blur', function() {
                scope.$apply(attrs.ngBlur);
            });
        };
    });


//Hides or shows any element with: project-role="owner"
//  if the project is owned by the current user
//  available project roles = owner, editor
//NOTE: to use this directive, your controller must have the $rootScope defined.
common_module.directive('projectRole', function($rootScope){
    return {
        link: function(scope,element, attrs)
        {
            if(!attrs.projectRole)
            {
                throw new Exception("Configuration error: project-role attribute must specify a target role name, 'owner' or 'editor'.");
            }

            var role = attrs.projectRole.trim();

            if(role != 'owner' && role != 'editor' && role != 'not-external')
                throw new Exception("Configuration error: project-role attribute must be 'owner' or 'editor' or 'not-external'.");

            var show = false; //default to NOT show.

            function applyRoleToElement()
            {                

                if(role == 'owner' && $rootScope.Profile.isProjectOwner(scope.project))
                {
                    //console.log("Showing role 'owner' because user is owner.");
                    show = true;
                }

                if(role == 'editor' && ($rootScope.Profile.isProjectOwner(scope.project) || $rootScope.Profile.isProjectEditor(scope.project)))
                {
                    //console.log("Showing role 'editor' because user is owner or editor.");
                    show = true;
                }

                if (role == 'not-external' && !$rootScope.Profile.isExternal() )
                {
                    show = true;
                }

                if(show)
                    element.show();
                else
                    element.hide();
            }

            if(!scope.project || !scope.project.$resolved)
            {
//                console.log("setting watch");
                var projectWatch = scope.$watch('project',function(){
                    if(scope.project != null)
                    {
  //                      console.log("got a new project hit");
                        projectWatch();
                        scope.project.$promise.then(function(){
    //                        console.log("Promise completed.");
                            applyRoleToElement();
                        });
                    }
                });
            }

            applyRoleToElement();
        }
    };
});

//Hides or Shows any element with: has-role="someRole"
//  where "someRole" is in the current user's roles list
common_module.directive('hasRole', function($rootScope){
    return{
        link: function(scope, element, attrs) {
            //console.log("checking permission");

            if(!attrs.hasRole)
                return;

            var value = attrs.hasRole.trim();
            
            var notPermissionFlag = value[0] === '!';
            
            if(notPermissionFlag)
                value.slice(1).trim();

            //console.dir($rootScope.Profile.Roles);
            //console.dir($rootScope.Profile.Fullname);

            if(!$rootScope.Profile.Roles)
                $rootScope.Profile.Roles = [];
            //else
                //if(!Array.isArray($rootScope.Profile.Roles))
                //    $rootScope.Profile.Roles = angular.fromJson($rootScope.Profile.Roles);

            //console.dir($rootScope.Profile.Roles);

            var hasPermission = $rootScope.Profile.Roles[value] ? true : false;

            //console.log(value + " ? " + hasPermission);

            if(hasPermission || (notPermissionFlag && !hasPermission) )
            {
                console.log("hasPermission("+value+") = true");
                element.show();
            }
            else
            {
                console.log("hasPermission("+value+") = false");
                element.hide();
            }
        }
    };
});