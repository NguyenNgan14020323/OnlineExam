/**
* Loading Directive
* @see http://tobiasahlin.com/spinkit/
*/

angular
.module('RDash')
.directive('fileReader', [function() {
      return{
        scope: {
          fileReader:"="
        },
        templateUrl: 'templates/questions/questionNew.html',
        link : function(scope, element, attrs){
                //Add event listener for 'change' event
            element.on('change', function(changeEvent) {
              var files = changeEvent.target.files;
        if (files.length) {
          var r = new FileReader();
          r.onload = function(e) {
              var contents = e.target.result;
              scope.$apply(function () {
              //   scope.fileReader = contents;
              //   scope.testing = contents;
                var allTextLines = contents.split(/\r\n|\n/);
                var headers = allTextLines[0].split(',');
                var lines = [];
                for ( var i = 0; i < allTextLines.length; i++) {
                    // split content based on comma
                    var data = allTextLines[i].split(',');
                    if (data.length == headers.length) {
                        var tarr = [];
                        for ( var j = 0; j < headers.length; j++) {
                            tarr.push(data[j]);
                        }
                        lines.push(tarr);
                    }
                }
                scope.fileReader = lines;
              })
          };    
          r.readAsText(files[0]);
        }
              });
        }
    }
}]);