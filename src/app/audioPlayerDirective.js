angular
    .module('AudioListApp')
    .directive('audioPlayer', audioPlayer);

function audioPlayer() {
    var template = '<audio src="{{audioPlayer.src}}" controls>' +
        '</audio>';

    return {
        scope: true,
        restrict: 'A',
        controller: ['$scope', audioPlayerController],
        controllerAs: 'audioPlayer',
        template: template,
        link: function(scope, elem, attrs) {
            scope.audioPlayer.initialize(attrs.audioSrc);
            scope.$on("$destroy", function() {
                scope.audioPlayer.destroyInstance();
            });
        }
    };

    function audioPlayerController($scope) {
        this.initialize = function(audioSrc) {
            this.src = audioSrc;
        };

        this.destroyInstance = function() {

        };
    }
}
