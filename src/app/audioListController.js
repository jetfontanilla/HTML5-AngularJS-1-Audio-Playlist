angular
    .module('AudioListApp')
    .controller('AudioListController', ['$http', AudioListController]);

function AudioListController($http) {
    this.data = [];

    var self = this;
    (function initialize(self) {
        $http.get('test-audio-data.json').then(function(response) {
            self.data = response.data;
        })
    })(self);
}