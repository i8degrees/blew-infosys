// Grunt build tasks for averylawfirm.com
//
// See also: package.json

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      // Environment: Development
      debug: {
        options: {
          style: 'expanded',
          debugInfo: false
        },
        files: {
          'public/css/common.css' : 'sass/common.scss',
          'public/css/error.css' : 'sass/error.scss',
          'public/css/mobile.css' : 'sass/mobile.scss',
          'public/css/style.css' : 'sass/style.scss'
        }
      },
      // Environment: Production
      release: {
        options: {
          style: 'compressed',
          debugInfo: false
        },
        files: [{
          expand: true,
          cwd: 'sass',
          src: ['*.scss'],
          dest: './public/css',
          ext: '.css'
        }]
      },
    },
    watch: {
      config: {
        files: [ 'Gruntfile.js', 'app.js', '.env*' ],
        options: {
          reload: true
        }
      },
      templates: {
        files: [ 'views/*.jade' ],
        options: {
          livereload: true
        },
      },
      scripts: {
        files: [ 'lib/*.js', 'models/*.js', 'routes/*.js' ],
        options: {
          reload: true
        },
      },
      stylesheets: {
        files: [ 'sass/*.scss' ],
        tasks: ['sass'],
        options: {
          livereload: true
        },
      },
    },
    jshint: {
      options: {
        reporter: require('jshint-stylish')
      },
      all: [
        'app.js',
        'Gruntfile.js',
        'lib/**/*.js',
        'models/*.js',
        'routes/*.js'
      ],
    },
  });

  // Dependencies

  // https://github.com/gruntjs/grunt-contrib-watch
  grunt.loadNpmTasks('grunt-contrib-watch');
  // https://github.com/gruntjs/grunt-contrib-sass
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['watch', 'sass:debug']);

  // TODO(jeff): Install validation lints for HTML, CSS, SASS and so on
  grunt.registerTask('lint', [ 'jshint' ]);

  // grunt.registerTask('runapp', ['shell:runapp']);

  // Sourced in package.json -- called from bin/heroku_deploy.sh
  grunt.registerTask('heroku', ['sass:release']);
};
