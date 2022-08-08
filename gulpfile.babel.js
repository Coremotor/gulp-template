import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import remane from "gulp-rename";
import { deleteAsync } from "del";
import babel from "gulp-babel";
import uglify from "gulp-uglify";
import concat from "gulp-concat";

const sass = gulpSass(dartSass);

const paths = {
  styles: {
    src: "src/styles/**/*.scss",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/js/",
  },
};

async function clean() {
  return await deleteAsync(["dist"]);
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(
      remane({
        basename: "main.",
        suffix: "min",
      })
    )
    .pipe(gulp.dest(paths.styles.dest));
}

export function scripts() {
  return gulp
    .src(paths.scripts.src, {
      sourcemaps: true,
    })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
}

const build = gulp.series(clean, gulp.parallel(styles, scripts), watch);
export default build;
