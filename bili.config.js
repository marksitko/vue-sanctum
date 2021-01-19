module.exports = {
    banner: true,
    output: {
        extractCSS: false,
    },
    plugins: {
        vue: true,
        copy: {
            targets: [
                { src: 'src/.eslintrc.js', dest: 'dist/'}
            ]
        }
    }
};
