var config = {
	userName: process.env.npm_package_config_username || process.env.username,
	password: process.env.npm_package_config_password || process.env.password,
	server: process.env.npm_package_config_server || process.env.server,
	options: {
		database: process.env.npm_package_config_database || process.env.database,
		encrypt: true,
		"rowCollectionOnRequestCompletion": true
	}
};

module.exports = config;