angular
    .module('AudioListApp')
    .controller('AudioListController', ['$scope', '$http', AudioListController]);

function AudioListController($scope, $http) {
    this.data = [];

    var self = this;
    (function initialize(self) {
        $http.get('test-audio-data.json').then(function(response) {
            self.data = response.data;
        })
    })(self);

    $scope.$on('currentRowId', function(event, rowId) {
        $scope.$applyAsync(function() {
            self.currentRowId = rowId;
        });
    });
}