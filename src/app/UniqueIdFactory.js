angular
    .module('AudioListApp')
    .factory('UniqueIdFactory', function() {

        var startId = 1;
        var counters = {};
        var Service = {};

        function generateId(NS, counter) {
            return NS + counter.toString();
        }

        Service.generateId = function(NS) {
            if (NS in counters) {
                counters[NS] += 1;
            } else {
                counters[NS] = startId;
            }

            return generateId(NS, counters[NS]);
        };

        Service.getNext = function(NS, currentId) {
            if (NS in counters) {
                maxCounter = counters[NS];
            } else {
                maxCounter = startId;
            }

            var currentCounter = parseInt(currentId.replace(NS, ''));
            if (currentCounter >= maxCounter) {
                return null;
            } else {
                return generateId(NS, currentCounter + 1);
            }

        };

        return Service;
    });