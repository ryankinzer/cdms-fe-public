// CDMS Application bootstrapper
"use strict";
(function (angular) {

    var root = location.pathname.replace(new RegExp(/\/[^\/]+$/), '');

    define('angular', function () {
        return angular;
    });

    require({
        async: true,
        packages: [{
            name: 'app',
            location: root + '/app'
        }]
    });


    // require loads each of the javascript files referenced below, which can in turn load other files.
    require([
      'angular',
      'dojo/parser',
      'dijit/Menu',
      'dijit/MenuItem',
      'dijit/form/DropDownButton',
      'app',                                                    //main.js
      'app/core/common/common-module',
      'app/core/projects/projects-module',
      'app/core/datasets/datasets-module',
      'app/core/admin/admin-module',
      'app/core/preferences/preferences-module',
      'app/private/appraisals/appraisals-module',
      'app/private/crpp/crpp-module',
      'app/private/habitat/habitat-module',

    ], function (angular, parser) {
   
        angular.element(document).ready(function () {           //punch it, Chewy!
      
	        //check our authentication and setup our user profile first of all!
	        //http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
	
  	        $.get(WHOAMI_URL, function(data){
		        //console.log("Inside init.js, $.get...");
		        //console.log("data is next...");
		        //console.dir(data);
  		        profile = data;
  	        })
            .fail(function(){
              window.location=LOGIN_URL;
            })
            .always(function () {

                console.log("Booting dojo...");
                parser.parse();

                require(['dojo/domReady!'], function () {
                    console.log("Booting angular...");
                    setTimeout(function () {
                        angular.bootstrap(document.body, ['app']);
                        console.log("all systems GO!")
                    }, 2000);
                });
                
                
  	        });
	  
      });
  
    });


}(angular));