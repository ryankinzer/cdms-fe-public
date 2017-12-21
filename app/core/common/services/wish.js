
//from : http://stackoverflow.com/questions/17547399/angularjs-arcgis
common_module.service('wish', function () {

    // it's not require... it's a wish?
    var wish = {};

    function _loadDependencies(deps, next) {
        var reqArr = {}; var keysArr = {};

        angular.forEach(Array.keys, function (key, val) {
            keysArr.push(key);
            reqArr.push(val);
        });

        // use the dojo require (required by arcgis + dojo) && save refs
        // to required obs
        try {
            require(reqArr, function () {
                var args = arguments;

                angular.forEach(keysArr, function (name, idx) {
                    wish[name] = args[idx];
                });

                next();
            });

        } catch (e) {
            console.dir(e);

        }
    }

    return {
        loadDependencies: function (deps, next) {
            _loadDependencies(deps, next);
        },

        get: function () {
            return wish;
        }
    };
});