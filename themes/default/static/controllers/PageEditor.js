function PageEditor($scope, $element, $http) {
  var mediumEditorOptions = {
      placeholder: ''
    , firstHeader: 'h1'
    , secondHeader: 'h2'
    , forcePlainText: false
    , cleanPastedHTML: true
    , disableDoubleReturn: true
    , buttons: [ 'bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote', 'unorderedlist', 'orderedlist' ]
  };

  $scope.state = 'pageEditor';
  $scope.editor = new MediumEditor($element.find('main').get(0), mediumEditorOptions);

  $scope.data = $scope.data || {};
  $scope.data._id = $element.find('#pageData_id').get(0).getAttribute('value');
  $scope.data.title = null;
  $scope.data.publishedAt = null;
  $scope.data.parent = undefined; // Set to undefined as angular adds an empty option for the select tag if null
  $scope.data.content = null;

  $scope.parentOptions = [];

  $scope.getPageDataFromServer = function () {
    $http({ method: 'GET', url: '/api/v1/Page/' + $scope.data._id })
      .success(function (page) {
        var key = '';

        for(key in page) {
          if (page.hasOwnProperty(key) && page[key]) {
            $scope.data[key] = page[key];
          }
        }
      })
      .error(function (err) {
        console.error(err);
      })
  };

  $scope.updateParentFieldOptionsFromServer = function () {
    $http({ method: 'GET', url: '/api/v1/Page?fields=_id url' })
      .success(function (pages) {
        pages.unshift({ url: 'No parent' });
        $scope.parentOptions = pages.filter(function (page) {
          return page.url !== '/';
        });
      })
      .error(function (err) {
        console.error(err);
      })
  };

  $scope.getPageDataFromServer();
  $scope.updateParentFieldOptionsFromServer();
}
