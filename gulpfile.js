"use strict";

var gulp = require("gulp");
var del = require("del");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var sprite = require("gulp-svgstore");
var html = require("gulp-posthtml");
var include = require("posthtml-include");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var server = require("browser-sync").create();

gulp.task("clean", function() {
    return del("build");
});

gulp.task("images", function() {
    return gulp.src("src/img/**/*.{png,jpg,svg}")
        .pipe(imagemin([
            imagemin.optipng({
                optimizationLevel: 3
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest("src/img"));
});

gulp.task("copy", function() {
    return gulp.src([
        "src/fonts/**/*.{woff,woff2}",
        "src/img/**",
        "src/js/**",
        "src/*.ico",
        "src/*.png",
        "src/*.svg",
        "src/*.webmanifest",
        "src/*.xml",
    ], {
        base: "src"
    })
        .pipe(gulp.dest("build"));
});

gulp.task("html", function() {
    return gulp.src("src/*.html")
        .pipe(html([
            include()
        ]))
        .pipe(gulp.dest("build"));
});

gulp.task("webp", function() {
    return gulp.src("src/img/**/*.{png,jpg}")
        .pipe(webp({
            quality: 90
        }))
        .pipe(gulp.dest("src/img"));
});

gulp.task("css", function() {
    return gulp.src("src/scss/style.scss")
        .pipe(plumber())
        .pipe(sourcemap.init())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(csso())
        .pipe(rename("style.min.css"))
        .pipe(sourcemap.write("."))
        .pipe(gulp.dest("build/css"))
        .pipe(server.stream());
});

gulp.task("sprite", function() {
    return gulp.src("src/img/icon-*.svg")
        .pipe(sprite({
            inlineSvg: true
        }))
        .pipe(rename("sprite.svg"))
        .pipe(gulp.dest("build/img"));
});

gulp.task("server", function() {
    server.init({
        server: "src/",
        notify: false,
        open: true,
        cors: true,
        ui: false
    });

    gulp.watch("src/sass/**/*.sass", gulp.series("css"));
    gulp.watch("src/*.html").on("change", server.reload);
});

gulp.task("build", gulp.series("clean", "copy", "css", "sprite", "html"))
gulp.task("start", gulp.series("build", "server"));