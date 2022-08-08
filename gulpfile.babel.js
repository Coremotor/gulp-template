import gulp from "gulp";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import cleanCSS from "gulp-clean-css";
import remane from "gulp-rename";
import { deleteAsync } from "del";
import newer from "gulp-newer";
import babel from "gulp-babel";
import uglify from "gulp-uglify";
import concat from "gulp-concat";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import imagemin from "gulp-imagemin";
import htmlmin from "gulp-htmlmin";
import browserSync from "browser-sync";
import ts from "gulp-typescript";

const sass = gulpSass(dartSass);
const server = browserSync.create();

const paths = {
  styles: {
    src: "src/styles/**/*.scss",
    dest: "dist/styles/",
  },
  scripts: {
    src: ["src/scripts/**/*.js", "src/scripts/**/*.ts"],
    dest: "dist/scripts/",
  },
  assets: {
    src: "src/assets/**/*",
    dest: "dist/assets",
  },
  html: {
    src: "src/**/*.html",
    dest: "dist/",
  },
};

async function clean() {
  return await deleteAsync(["dist/*", "!dist/assets"]);
}

function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(
      remane({
        basename: "main.",
        suffix: "min",
      })
    )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream());
}

function scripts() {
  return gulp
    .src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(
      ts({
        noImplicitAny: true,
        outFile: "output.js",
      })
    )
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(server.stream());
}

function assets() {
  return gulp
    .src(paths.assets.src)
    .pipe(newer(paths.assets.dest))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.assets.dest));
}

function html() {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(server.stream());
}

function watch() {
  serve();
  gulp.watch(paths.html.dest).on("change", server.reload);
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.assets.src, assets);
}

function serve() {
  server.init({
    server: {
      baseDir: "./dist/",
    },
  });
}

const build = gulp.series(
  clean,
  html,
  gulp.parallel(styles, scripts, assets),
  watch
);
export default build;
