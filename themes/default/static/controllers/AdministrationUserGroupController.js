function AdministrationUserGroupController($scope, ResourceService) {
  $scope.data = {
    userGroups: ResourceService.bindToResource({
      url: '/api/v1/UserGroup/:id',
      name: 'UserGroup'
    })
  };
}
