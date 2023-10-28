module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      default: {
        tsconfig: "tsconfig.json",
      },
    },
    copy: {
      assets: {
        expand: true,
        cwd: "assets/",
        src: ["**/*"],
        dest: "dist/assets/",
      },
    },
  });

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-contrib-copy");

  grunt.registerTask("build", ["ts", "copy:assets"]);
};
