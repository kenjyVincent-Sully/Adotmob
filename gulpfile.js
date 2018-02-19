// Stock the gulp object
var gulp = require('gulp');
// Allows you to add prefixes in css
// ex : transform: scale(2) =-moz-transform: scale(2);-buildkit-transform: scale(2);
var autoprefixer = require('gulp-autoprefixer');
// Generate CSS Sourcemaps
var sourcemaps = require('gulp-sourcemaps');
// Add image minify in cache
var cache = require('gulp-cache');
// Merge JS Files
var useref = require('gulp-useref');
//Minify Images
var imagemin = require('gulp-imagemin');
// Add if support
var gulpif = require('gulp-if');
// Clear cache
var del = require('del');
// Minify JS
var uglify = require('gulp-uglify');
// Minify CSS
var minifyCSS = require('gulp-minify-css');
// Refresh browser on save
var browserSync = require('browser-sync');
// Get error information with uglify
var gutil = require('gulp-util');
// Call function in order
var runSequence = require('run-sequence');

//Copy CSS sourcemaps from src to build folder
gulp.task('cssmaps', function(){
  return gulp.src('src/css/maps/**/*')
    .pipe(gulp.dest('build/css/maps'));
});

//Read HTML file to merge CSS and JS than minify them
gulp.task('useref', function(){

  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpif('*.css', minifyCSS({shorthandCompacting:false}).on('error', gutil.log)))
    .pipe(gulpif('*.js', uglify().on('error', gutil.log)))
    .pipe(gulpif('*.css',sourcemaps.write('css/maps')))
    .pipe(gulpif('*.js',sourcemaps.write('js/maps')))
    .pipe(gulp.dest('build'));
});

//Compresses images
gulp.task('images', function(){
  return gulp.src('src/img/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('build/img'));
});

//Copy Video from scr to web folder
gulp.task('video', function(){
  return gulp.src('src/video/**/*')
    .pipe(gulp.dest('build/video'));
});

//Copy Fonts from scr to web folder
gulp.task('fonts', function(){
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('build/fonts'));
});
//Delete build folder
gulp.task('clean', function(callback){
  del('build');
  return cache.clearAll(callback);
});

//Clear Web folder and keep images already generated
gulp.task('clean:build', function(callback){
  return del(['build/**/*'], callback);
});
// Refresh the sass modification page
gulp.task('browserSync', function() {
  browserSync({
    proxy: 'http://127.0.0.1/adotmob/src/index.html'
  })
});

// Lets you see each change in .css files
// in case of change the sass task will call
gulp.task('watch',function() {
  gulp.watch('src/css/*.css', browserSync.reload);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/js/*.js', browserSync.reload);
});

//Run sequence to build build folder
gulp.task('build', function(callback){
  runSequence('clean:build', ['useref','images','video','fonts'], callback);
});

// This task is called default and can be started by typing the gulp command
// The spot between hook allows to launch at the same time
gulp.task('default', function(callback){
  runSequence(['browserSync','watch'],callback);
});