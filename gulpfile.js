"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var posthtml =  require("gulp-posthtml");
var csso = require("gulp-csso");
var webp = require("gulp-webp");
var server = require("browser-sync").create();
var del = require("del");



gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()//автопрефиксы добавили дл разных браузеров
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))//минификация файла style.css
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))//папка css сейчас будет в build, из source она уходит
    .pipe(server.stream());
});


gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml())
    .pipe(gulp.dest("build"));
});


gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimmizationLevel: 3}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.svgo()

    ]))

    .pipe(gulp.dest("source/img"));
});


gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});


gulp.task("clean", function () {
  return del("build");//чистит папку build
});


gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.html",//сама написала
    "source/*.ico",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));

});




gulp.task("server", function () {
  server.init({
    server: "build/", // когда запускаем localhost:3000 теперь смотрти на папку build
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));//заменить на refresh  on("change", server.reload)
});


gulp.task("refresh", function (done) {
  server.reload();
  done();
});


gulp.task("build", gulp.series(//запускает последовательность задач
  "clean",//чистит папку build
  "copy",//копируе все файлы в папку build
  "css",//создает style.min.css с префиксами
  "html"
));


gulp.task("build", gulp.series("css", "html"));//build запускает таски  "css" потом  "html"

gulp.task("start", gulp.series("build", "server"));//сперва запустится здача build потом  задача server
