function AdministrationPageController($scope, ResourceService) {
  $scope.data = {
    pages: ResourceService.bindToResource({
      url: '/api/v1/Page/:id',
      name: 'Page'
    })
  };
}
