/**
 * @param {typeof import("grunt")} grunt
 */
module.exports = function (grunt) {
  grunt.initConfig({
    exec: {
      tsc: {
        cmd: "yarn tsc",
      },
      tsc_alias: {
        cmd: "yarn tsc-alias",
      },
    },
  });

  // grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-exec");

  grunt.registerTask("build", ["exec:tsc", "copy:assets", "exec:tsc_alias"]);
};
