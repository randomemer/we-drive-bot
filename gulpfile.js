const gulp = require("gulp");
const ts = require("gulp-typescript");
const sourcemaps = require("gulp-sourcemaps");
const tsAlias = require("gulp-ts-alias").default;
const path = require("path");

const tsProj = ts.createProject("tsconfig.json");

gulp.task("default", () => {
  // Compile typescript files
  const tsResult = tsProj
    .src()
    .pipe(tsAlias({ config: tsProj.config.compilerOptions }))
    .pipe(sourcemaps.init())
    .pipe(tsProj());

  // Copy assets
  gulp.src("src/assets/**/*.*").pipe(gulp.dest("dist/assets"));

  return tsResult.js
    .pipe(
      sourcemaps.write({
        sourceRoot: (file) =>
          path.relative(path.join(file.cwd, file.path), file.base),
      })
    )
    .pipe(gulp.dest("dist"));
});
