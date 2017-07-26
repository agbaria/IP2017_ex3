var config = {
	userName: process.env.npm_package_config_username,
	password: process.env.npm_package_config_password,
	server: process.env.npm_package_config_server,
	options: {
		database: process.env.npm_package_config_database,
		encrypt: true,
		"rowCollectionOnRequestCompletion": true
	}
};

module.exports = config;