const {execSync} = require('child_process')

module.exports = function(eleventyConfig) {

    eleventyConfig.on('beforeBuild', function() {
        execSync('pnpx gulp styles', { stdio: 'inherit' })
    })

    return {
        dir: {
            input: 'src',
            output: 'dist',
            data: 'data',
            includes: 'components',
            layouts: 'layouts'
        }
    }
}