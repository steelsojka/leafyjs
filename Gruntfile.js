var exec = require("child_process").exec;

module.exports = function(grunt) {

	var buildHeader = [
		"/**",
		" * <%= pkg.name %>.js v<%= pkg.version %> by <%= pkg.author %>",
		" * <%= pkg.repository.url %>",
		" * License: <%= pkg.license %>",
		" */"
	].join("\n");

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		jshint: {
			files: ["src/*.js"],
			options: grunt.file.readJSON(".jshintrc")
		},
		uglify: {
			options: {
				banner: buildHeader,
				sourceMap: true,
				sourceMapName: "build/<%= pkg.name %>.map"
			},
			dist: {
				files: {
					'build/<%= pkg.name %>.min.js': ["src/*.js"]
				}
			}
		},
    clean: ["build"],
		karma: {
      angular: {
        configFile: "karma.conf.js"
      }
		}
	});

  grunt.registerTask("coveralls", function() {
    var done = this.async();

    if (!process.env.CI) {
      console.log("Aborting coveralls. Not a CI environment!");
      done();
      return;
    }

    var path = grunt.file.expand("coverage/**/lcov.info")[0];

    exec("cat \"" + path + "\" | node_modules/coveralls/bin/coveralls.js", done);
  });

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-karma");

  grunt.registerTask("test", ["jshint", "karma", "coveralls"]);

  grunt.registerTask("build", [
    "clean",
    "uglify"
  ]);

	grunt.registerTask("default", ["build"]);
};
