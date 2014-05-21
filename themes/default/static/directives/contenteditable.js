app.directive('contenteditable', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      var updateModelTimer;

      // view -> model
      function updateModel() {
        clearTimeout(updateModelTimer);
        updateModelTimer = setTimeout(function () {
          scope.$apply(function() {
            ctrl.$setViewValue(elm.html());
          });
        }, 200);
      }

      elm.on('blur', updateModel);
      elm.on('keyup', updateModel);

      // model -> view
      ctrl.$render = function() {
        elm.html(ctrl.$viewValue);
      };

      // load init value from DOM
      ctrl.$setViewValue(elm.html());
    }
  };
});
