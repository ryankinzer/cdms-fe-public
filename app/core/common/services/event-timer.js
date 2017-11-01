common_module.service('eventTimer', [
    function () {
        var d = new Date();
        console.log(d.toLocaleTimeString());
    }]);