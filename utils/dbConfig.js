var config = {
	userName: process.env.username,
	password: process.env.password,
	server: process.env.server,
	options: {
		database: process.env.database,
		encrypt: true,
		"rowCollectionOnRequestCompletion": true
	}
};

console.log(process.env.username)

module.exports = config;