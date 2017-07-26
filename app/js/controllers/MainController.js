app.controller('MainController', ['$scope', '$http', '$cookies', 
	function($scope, $http, $cookies) {
		$scope.user = null;
		$scope.loged = false;

		let id = $cookies.get('id');
		if (id) {
			$scope.user = {
				id: id,
				username: $cookies.get('username'),
				name: $cookies.get('name')
			}

			$scope.loged = true;
		}

	}
]);