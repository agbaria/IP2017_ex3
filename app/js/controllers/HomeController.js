app.controller('HomeController', ['$scope', 'trending5', function($scope, trending) {
	trending.success((data) => {
		if (data.success) {
			$scope.trending = data.games;
		} else {

		}
	});
}]);