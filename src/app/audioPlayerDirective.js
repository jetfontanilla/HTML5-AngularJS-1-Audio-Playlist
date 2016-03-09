angular
    .module('AudioListApp')
    .factory('AudioEventFactory', [AudioEventFactory])
    .directive('audioPlayer', audioPlayer);

function AudioEventFactory() {
    var Service = {};
    var _playObservers = [];
    var _pauseObservers = [];
    var _stopObservers = [];

    function notifyObservers(observers, data) {
        observers.map(function(callback) {
            if (typeof callback == 'function') {
                if (data) {
                    callback(data);
                } else {
                    callback();
                }
            }
        });
    }

    Service.subscribePlayEvent = function(callback) {
        if (typeof callback == 'function') {
            _playObservers.push(callback);
        }
    };

    Service.subscribePauseEvent = function(callback) {
        if (typeof callback == 'function') {
            _pauseObservers.push(callback);
        }
    };

    Service.subscribeStopEvent = function(callback) {
        if (typeof callback == 'function') {
            _stopObservers.push(callback);
        }
    };

    Service.play = function(targetInstanceId) {
        notifyObservers(_playObservers, targetInstanceId);
    };

    Service.pause = function(fromInstanceId) {
        notifyObservers(_pauseObservers, fromInstanceId);
    };

    Service.stop = function(fromInstanceId) {
        notifyObservers(_stopObservers, fromInstanceId);
    };

    return Service;
}

function audioPlayer() {
    var template = '<button type="button" class="btn btn-danger">' +
        '<span class="glyphicon" ng-class="{' +
        '\'glyphicon-pause\': audioPlayer.isPlaying(),' +
        '\'glyphicon-play\': audioPlayer.isPaused() || audioPlayer.isStopped()' +
        '}"></span>' +
        '</button>' +
        '<audio ng-src="{{audioPlayer.src}}" id="{{audioPlayer.id}}">' +
        '</audio>';

    return {
        scope: true,
        restrict: 'A',
        controller: ['$scope', 'UniqueIdFactory', 'AudioEventFactory', audioPlayerController],
        controllerAs: 'audioPlayer',
        template: template,
        link: function(scope, elem, attrs) {
            scope.audioPlayer.initialize(elem, attrs);
        }
    };

    function audioPlayerController($scope, UniqueIdFactory, AudioEventFactory) {
        var NS = 'audioPlayer';
        var self = this;

        var STATUS_STOP = 'stop';
        var STATUS_PLAY = 'play';
        var STATUS_PAUSE = 'pause';

        this.status = STATUS_STOP;

        this.isPaused = function() {
            return this.status == STATUS_PAUSE;
        };

        this.isPlaying = function() {
            return this.status == STATUS_PLAY;
        };

        this.isStopped = function() {
            return this.status == STATUS_STOP;
        };

        function setPlayerStatus(status) {
            self.status = status;
            $scope.$applyAsync(function() {
                self.status = status;
            })
        }

        this.play = function() {
            if (self.isPlaying()) {
                return;
            }

            var currentAudio = document.getElementById(self.id);
            if (!currentAudio) {
                return;
            }
            currentAudio.play();
        };

        this.pause = function() {
            if (self.isPaused()) {
                return;
            }

            var currentAudio = document.getElementById(self.id);
            if (!currentAudio) {
                return;
            }
            currentAudio.pause();
            setPlayerStatus(STATUS_PAUSE);
        };

        this.stop = function() {
            if (self.isStopped()) {
                return;
            }

            var currentAudio = document.getElementById(self.id);
            if (!currentAudio) {
                return;
            }
            currentAudio.pause();
            currentAudio.currentTime = 0;
            setPlayerStatus(STATUS_STOP);
        };

        this.initialize = function(elem, attrs) {
            if (!attrs.audioSrc) {
                return;
            }

            this.src = attrs.audioSrc;
            this.id = UniqueIdFactory.generateId(NS);
            this.rowId = attrs.rowId;

            elem.bind('click', function() {
                if (!self.isPlaying()) {
                    AudioEventFactory.stop(self.id);
                    self.play();
                } else {
                    self.pause();
                }
            });

            $scope.$applyAsync(function() {
                var currentAudio = document.getElementById(self.id);
                if (!currentAudio) {
                    return;
                }
                setUpHandlers(currentAudio);
                autoPlayNextDirective(currentAudio);
            });

        };

        function setUpHandlers(currentAudio) {
            currentAudio.addEventListener('playing', function() {
                $scope.$emit('currentRowId', self.rowId);
                setPlayerStatus(STATUS_PLAY);
            });

            currentAudio.addEventListener('ended', function() {
                setPlayerStatus(STATUS_STOP);
            });
        }

        function autoPlayNextDirective(currentAudio) {
            var nextId = UniqueIdFactory.getNext(NS, self.id);
            if (nextId) {
                currentAudio.addEventListener('ended', function() {
                    AudioEventFactory.play(nextId);
                });
            }
        }

        AudioEventFactory.subscribePlayEvent(function(targetInstanceId) {
            if (targetInstanceId == self.id) {
                self.play();
            } else {
                self.stop();
            }
        });

        AudioEventFactory.subscribePauseEvent(function(fromInstanceId) {
            if (fromInstanceId != self.id) {
                self.pause();
            }
        });

        AudioEventFactory.subscribeStopEvent(function(fromInstanceId) {
            if (fromInstanceId != self.id) {
                self.stop();
            }
        });
    }
}