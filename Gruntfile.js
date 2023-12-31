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
    copy: {
      assets: {
        expand: true,
        cwd: "src/assets/",
        src: ["**/*"],
        dest: "dist/assets/",
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-exec");

  grunt.registerTask("build", ["exec:tsc", "exec:tsc_alias", "copy:assets"]);
};
