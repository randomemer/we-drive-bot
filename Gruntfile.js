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
        src: "src/assets/",
        dest: "dist/assets/",
      },
    },
    exec: {
      remap_paths: {
        cmd: "yarn tsc-alias",
      },
    },
  });

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-exec");

  grunt.registerTask("build", ["ts", "copy:assets", "exec:remap_paths"]);
};
