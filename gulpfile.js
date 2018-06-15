const gulp = require('gulp');
const rename = require('gulp-rename');
const cssmin = require('gulp-cssmin');
const uglify = require('gulp-uglify');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const pkg = require('./package');

gulp.task('css', async () => {
    await new Promise(resolve => {
        gulp.src('./src/css/cordelia.css')
            .pipe(gulp.dest('./dist/css'))
            .on('end', resolve);
    });

    await new Promise(resolve => {
        gulp.src('./dist/css/cordelia.css')
            .pipe(cssmin())
            .on('error', e => {
                console.log(e);
                resolve();
            })
            .pipe(rename('cordelia.min.css'))
            .pipe(gulp.dest('./dist/css'))
            .on('end', resolve);
    });
});

gulp.task('icons', () => {
    gulp.src('./src/icons/**')
        .pipe(gulp.dest('./dist/icons/'));
});

const banner = `/*!
 *   Cordelia color picker
 *   version: ${pkg.version}
 *    author: ${pkg.author.name} <${pkg.author.email}>
 *   website: ${pkg.author.url}
 *    github: ${pkg.repository.url}
 *   license: ${pkg.license}
 */
`;
gulp.task('rollup', async () => {
    const bundle = await rollup.rollup({
        input: './src/js/cordelia.js',
        plugins: [
            nodeResolve(),
            commonjs(),
            babel({
                plugins: [
                    ['external-helpers']
                ],
                presets: [
                    ['env', {modules: false}]
                ]
            })
        ]
    });

    await bundle.write({
        banner,
        file: 'dist/js/cordelia.js',
        format: 'umd',
        name: 'Cordelia'
    });

    await bundle.write({
        banner,
        file: 'dist/js/cordelia.common.js',
        format: 'cjs',
    });

    await bundle.write({
        banner,
        file: 'dist/js/cordelia.esm.js',
        format: 'es',
    });

    gulp.src('dist/js/cordelia.js')
        .pipe(uglify({
            output: {
                comments: /cordelia/
            }
        }))
        .pipe(rename('cordelia.min.js'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('default', () => {
    gulp.watch('./src/css/**', ['css']);
    gulp.watch('./src/icons/**', ['icons']);
    gulp.watch('./src/js/**', ['rollup']);
    gulp.start(['css', 'icons', 'rollup']);
});