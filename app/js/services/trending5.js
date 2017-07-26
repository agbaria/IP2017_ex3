app.factory('trending5', ['$http', function($http) {
	return $http({
			method: 'GET',
			url: 'https://ip2017-games-store.herokuapp.com/Trending5'
		})
		.then((data) => {
			return data.data;
		})
		.catch((err) => {
			return err;
		})
}]);