const {execSync} = require('child_process')
const {EleventyServerlessBundlerPlugin} = require('@11ty/eleventy')

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
        name: 'serverless',
        functionsDir: './netlify/functions/',
        copy: [
            { from: '.cache', to: 'cache' }
        ]
    })

    eleventyConfig.on('beforeBuild', function() {
        execSync('npx gulp styles', { stdio: 'inherit' })
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