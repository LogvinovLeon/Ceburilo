var source = require('vinyl-source-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var notify = require("gulp-notify");
var babel = require('babelify');
var scriptsDir = './src';
var buildDir = './build';
var livereload = require('gulp-livereload');


function handleErrors() {
    var args = Array.prototype.slice.call(arguments);
    notify.onError({
        title: "Compile Error",
        message: "<%= error.message %>"
    }).apply(this, args);
    this.emit('end');
}

function buildScript(file, watch) {
    var props = {entries: [scriptsDir + '/' + file], debug: true, cache: {}, packageCache: {}};
    var bundler = watch ? watchify(browserify(props)) : browserify(props);
    bundler.transform(babel);
    bundler.transform(reactify);
    function rebundle() {
        var stream = bundler.bundle();
        return stream.on('error', console.log.bind(console))
            .pipe(source(file))
            .pipe(gulp.dest(buildDir + '/'))
            .pipe(livereload());
    }

    bundler.on('update', function () {
        rebundle();
        gutil.log('Rebundle...');
    });
    return rebundle();
}

gulp.task('html', function () {
    gulp.src(scriptsDir + "/**/*.html")
        .pipe(gulp.dest(buildDir))
        .pipe(livereload());
});

gulp.task('css', function () {
    gulp.src(scriptsDir + "/**/*.css")
        .pipe(concat('style.css'))
        .pipe(gulp.dest(buildDir))
        .pipe(livereload());
});

gulp.task('assets', function () {
    gulp.src(scriptsDir + "/assets/**.*")
        .pipe(gulp.dest(buildDir))
        .pipe(livereload());
});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch(scriptsDir + "/**/*.html", ['html']);
    gulp.watch(scriptsDir + "/**/*.css", ['css']);
    gulp.watch(scriptsDir + "/assets/**.*", ['assets']);
});

gulp.task('build', ['html', 'css', 'assets'], function () {
    return buildScript('main.js', false);
});

gulp.task('default', ['build', 'watch'], function () {
    return buildScript('main.js', true);
});