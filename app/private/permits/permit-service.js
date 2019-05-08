//Permits api

permit_module.factory('AllPermits', ['$resource', function ($resource) {
    return $resource(serviceUrl + '/api/v1/permit/allpermits', {}, {
        query: { method: 'GET', params: {}, isArray: true }
    });
}]);






permit_module.service('PermitService', ['$q',

    'AllPermits',
  
    function ($q,
       
        AllPermits,
      
    ) {
        var service = {

            getAllPermits: function () {
                return AllPermits.query();
            },
            
        };

        return service;

    }
]);


