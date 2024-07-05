import gulp from "gulp";
import browserify from "browserify";
import source from "vinyl-source-stream";
// import tsify from "tsify";
import buffer from "vinyl-buffer";
import babelify from "babelify";
import sourcemaps from "gulp-sourcemaps";
import gutil from "gulp-util";
import uglify from "gulp-uglify";
import rename from "gulp-rename";

gulp.task("nosql-min", () => {
  return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/nosql.ts"], // Your entry point(s)
      cache: {},
      packageCache: {}
  })
  .plugin("tsify", { target: "es2016"}) // TypeScript plugin
  .transform(babelify.configure({
    presets: ["es2015"]
  }))
  // .transform(babelify, { presets: ["@babel/preset-env"], extensions: [".ts"] }) // Babelify with ES6+ presets
  .bundle()
  .pipe(source("nosql.js")) // Output filename
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(uglify()) // Minify (optional)
  .pipe(rename({ suffix: ".min" })) // Add ".min" to the filename
  .on("error", gutil.log)
  // .pipe(sourcemaps.write("./", {}))
  .pipe(gulp.dest("dist")); // Output directory
});

gulp.task("nosql-ts-min", () => {
  return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/nosql-ts.ts"], // Your entry point(s)
      cache: {},
      packageCache: {}
  })
  .plugin("tsify", { target: "es2016"}) // TypeScript plugin
  .transform(babelify.configure({
    presets: ["es2015"]
  }))
  // .transform(babelify, { presets: ["@babel/preset-env"], extensions: [".ts"] }) // Babelify with ES6+ presets
  .bundle()
  .pipe(source("nosql-ts.js")) // Output filename
  .pipe(buffer())
  .pipe(sourcemaps.init({ loadMaps: true }))
  .pipe(uglify()) // Minify (optional)
  .pipe(rename({ suffix: ".min" })) // Add ".min" to the filename
  .on("error", gutil.log)
  // .pipe(sourcemaps.write("./", {}))
  .pipe(gulp.dest("dist")); // Output directory
});