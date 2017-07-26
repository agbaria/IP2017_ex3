app.factory('trending5', ['$http', ($http) => {
	return $http.get('https://ip2017-games-store.herokuapp.com/Trending5')
		.success((data) => {
			return data;
		})
		.error((err) => {
			return err;
		})
}]);