const del = require('trash')

exports.default = async function() {
    const files = [
        'dist',
        'src/components/styles',
        'netlify/functions/serverless/*',
        '!netlify/functions/serverless/index.js',
        '.netlify/functions'
    ]
    
    await del(files)
}