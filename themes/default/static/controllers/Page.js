function Page($scope, $element) {
  var metaElement = $element.find('.meta')
    , contentElement = $element.find('.content');
console.log(contentElement);
  contentElement.attr('contentEditable', true);
}
