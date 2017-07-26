var app = angular.module('GamesStore', ['ngRoute', 'ngCookies']);

app.config(function ($routeProvider) { 
	$routeProvider 
		.when('/', { 
			controller: 'HomeController',
			template: "<div>{{trending[0].title}}</div>"
			//templateUrl: 'views/home.html' 
		})
		.otherwise({ 
			redirectTo: '/' 
		}); 
});