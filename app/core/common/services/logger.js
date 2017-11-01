
common_module.service('Logger', [
    function () {

        var service = {
            log: function () {
                for (var i = 0; i < arguments.length; i++) {

                    //output the argument
                    //console.log("arguments is next...");
                    //console.dir(arguments[i]);

                    //traverse recursively if it is an array
                    if (arguments[i] instanceof Array) {
                        var arrayArg = arguments[i];
                        this.log.apply(this, arrayArg);
                    }

                }
            },

            debug: function () {
                this.log.apply(this, arguments);
            },

            error: function () {
                this.log.apply(this, arguments);
                var message = { Message: arguments[0], Type: "ERROR" };
            },

            audit: function () {
                var message = { Message: arguments[0], Type: "AUDIT" };
                log.debug("AUDIT Message POSTED to server: " + arguments[0]);
            },
        };

        return service;

    }]);