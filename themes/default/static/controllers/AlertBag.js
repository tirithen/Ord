function AlertBag($scope, $rootScope) {
  $scope.alerts = [];

  $scope.addAlert = function(type, message, timeout) {
    var alertObject = { type: type || 'info', message: message, timeout: timeout === undefined ? 10000 : timeout };

    if (alertObject.timeout) {
      setTimeout(function () {
        var index = $scope.alerts.indexOf(alertObject);

        if (index !== -1) {
          $scope.closeAlert(index);
        }
      }, alertObject.timeout);
    }

    $scope.alerts.push(alertObject);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  };

  $rootScope.$on('addAlert', function (event, alert) {
    $scope.addAlert(alert.type, alert.message, alert.timeout);
  });
}
