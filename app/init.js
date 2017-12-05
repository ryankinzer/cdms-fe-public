// CDMS Application bootstrapper
/*global angular:true  <-- delete this line if commenting it out doesn't break anything... */

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

}(angular));

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
  'app/private/habitat/habitat-module'


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
  	    .always(function(){
            //require(['dojo/domReady'], function (doc) {
                console.log("Booting dojo...");
                parser.parse();
                console.log("Booting angular...");
                angular.bootstrap(document.body, ['app']);
              
                console.log("all systems GO!")
            //});
  	    });
	  
  });
  
});

