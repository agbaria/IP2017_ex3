app.controller('HomeController', ['$scope', 'trending5', function($scope, trending) {
	trending.then((data) => {
		if (data.success) {
			$scope.trending = data.games;
		} else {

		}
	});
}]);