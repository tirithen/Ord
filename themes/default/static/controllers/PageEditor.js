function PageEditor($scope, $rootScope, $element, $http) {
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
  $scope.data.title = $element.find('#pageDataTitle').get(0).getAttribute('value');
  $scope.data.publishedAt = $element.find('#pageDataPublishedAt').get(0).getAttribute('value');
  $scope.data.showInMenu = $element.find('#pageDataShowInMenu').get(0).getAttribute('checked');
  $scope.data.content = $element.find('main').get(0).innerHTML;
  $scope.data.parent = undefined; // Set to undefined as angular adds an empty option for the select tag if null

  $scope.parentOptions = [];

  $scope.submissionState = 'idle';

  $scope.getPageDataFromServer = function () {
    $http({ method: 'GET', url: '/api/v1/Page/' + $scope.data._id })
      .success(function (page) {
        var key = '';

        for(key in page) {
          if (page.hasOwnProperty(key)) {
            $scope.data[key] = page[key];
          }
        }

        if (!$scope.data.isPublished) {
          $rootScope.$emit('addAlert', { type: 'warning', message: 'This page is not published yet. It will be published ' + (new Date($scope.data.publishedAt)).toLocaleFormat(), timeout: false });
        }

        $scope.pageForm.$setPristine();
      })
      .error(function (err) {
        $rootScope.$emit('addAlert', { type: 'danger', message: 'Unable to load page data, please try to reload the page or try again later.' });
      });
  };

  $scope.updateParentFieldOptionsFromServer = function () {
    $http({ method: 'GET', url: '/api/v1/Page?fields=_id url' })
      .success(function (pages) {
        pages.unshift({ url: 'No parent' });
        $scope.parentOptions = pages.filter(function (page) {
          return page.url !== '/' && page._id !== $scope.data._id;
        });
      })
      .error(function (err) {
        $rootScope.$emit('addAlert', { type: 'danger', message: 'Unable to load parent page suggestions, please try to reload the page or try again later.' });
      });
  };

  $scope.submit = function () {
    var data = JSON.parse(JSON.stringify($scope.data));

    $scope.submissionState = 'submitting';

    if (data.parent === undefined) {
      data.parent = null;
    }

    $http({ method: 'POST', url: '/api/v1/Page', data: data })
      .success(function () {
        $rootScope.$emit('addAlert', { type: 'success', message: 'The page has been saved.' });
        $scope.submissionState = 'idle';
        $scope.pageForm.$setPristine();
      })
      .error(function (err) {
        $rootScope.$emit('addAlert', { type: 'danger', message: 'The page could not be saved, please verify that you are still logged in or try again later.' });
        $scope.submissionState = 'idle';
      });
  };

  if ($scope.data._id) {
    $scope.getPageDataFromServer();
  }
  $scope.updateParentFieldOptionsFromServer();
}