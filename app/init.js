// CDMS Application bootstrapper
(function (angular) {

    var root = location.pathname.replace(new RegExp(/\/[^\/]+$/), '');

    define('angular', function () {
        return angular;
    });

    require({
        async: true,
        packages: [
            { name: 'app', location: root + '/app' },
            { name: 'core', location: root + '/app/core' },
            { name: 'private', location: root + '/app/private' },
        ]
    });

    // require loads each of the javascript files referenced below, which can in turn load other files.
    require([
      'angular',
      'dojo/parser',
      'dijit/Menu',
      'dijit/MenuItem',
      'dijit/form/DropDownButton',
//      'app/app',                                                    //main.js
      'core/all-modules',
      'core/common/common-module',
      'core/projects/projects-module',
      'core/datasets/datasets-module',
      'core/admin/admin-module',
      'core/user/user-module',
      'private/all-modules',
      'private/crpp/crpp-module',
      'private/habitat/habitat-module',
      'private/appraisals/appraisals-module',

    ], function (angular, parser) {
   
        angular.element(document).ready(function () {           //punch it, Chewy!
      
	        //check our authentication and setup our user profile first of all!
	        //http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
	
  	        $.get(WHOAMI_URL, function(data){
  		        profile = data;
  	        })
            .fail(function(){
              window.location=LOGIN_URL;
            })
            .always(function () {

                console.log("Booting dojo...");
                //parser.parse();

                require(['dojo/domReady!'], function () {
                    console.log("Booting angular...");
                    setTimeout(function () {
                        angular.bootstrap(document.body, ['app']);
                        console.log("Inside init.js, all systems GO!")
                    }, 2000);
                });
                
                
  	        });
	  
      });
  
    });


}(angular))