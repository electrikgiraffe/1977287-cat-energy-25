import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';


// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber()) // обработка ошибок
    .pipe(sass()) // style.scss => style.css
    .pipe(postcss([ //style.css
      autoprefixer(), //style.css => style.css[prefix]
      csso(), //style.css[prefix] => style.css[prefix, min]
    ]))
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' })) // source/css
    .pipe(browser.stream());
}



//HTML

 const html = () => {
  return gulp.src('source/*.html')
  .pipe (htmlmin({ collapseWhitespace: true }))
  .pipe (gulp.dest('build'));
}

//Scripts

const scripts = () => {
return gulp.src('source/js/*.js')
.pipe(terser())
.pipe(gulp.dest('build/js'));
}


//Images

 const optimizeImages = () => {
  return gulp.src ('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src ("source/img/**/*.{jpg,png}")
  .pipe(gulp.dest("build/img"))
}

//Webp

 const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'))
}

//svg

 const svg = () =>
   gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg'])
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));

  const sprite = () => {
    return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

//Copy

 const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
    'source/manifest.webmanifest'
  ], {
  base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//Clean

 const clean = () => {
  return del ('build');
};

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html, reload));
  gulp.watch('source/js/*.js', gulp.series(scripts));
}

//Build

 export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    svg,
    sprite,
    createWebp
  )
);

//Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series (
    server,
    watcher
  ));
