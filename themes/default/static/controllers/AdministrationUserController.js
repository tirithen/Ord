function AdministrationUserController($scope, ResourceService) {
  $scope.data = {
    users: ResourceService.bindToResource({
      url: '/api/v1/User/:id',
      name: 'User'
    })
  };
}
