const Cache = require('@11ty/eleventy-cache-assets')
const _ = require('lodash')

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'
const KEY = process.env.YOUTUBE_API_KEY

const SOURCES = [
    'UCToDQGTa-S1hbnfXu47eULA', // PKSTV
    'UCIkLKSeWh7-tpPnVnoQlBfg', // PKSTV DPR RI
    'UCselK8dKN2wKx-v1ilJ80fQ', // Majelis Selasa TV
    'UCGnDTXkGhqiJpQ6cpKgtR6g', // Jazuli Juwaini
    'UChbJsQxU40pql2gabKCy8wQ', // Ahmad Syaikhu Asyik
    'UCaY27xawY-pUxFExWMH1VAg', // Mardani Ali Sera
    'UCk0Q0aPwGn0fZDE_fpsedkQ', // Cerita Ledia
    'UCKZEfS7ucKz3hBxmb48DivA'  // Gamal Albinsaid
]

const cacheOptions = {}

if(process.env.ELEVENTY_SERVERLESS) {
    cacheOptions.directory = 'cache'
}

async function getVideoPlaylist(id) {
    const url = `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${id}&key=${KEY}`
    const result = await Cache(url,{
        duration: '90d',
        type: 'json',
        ...cacheOptions
    })
    return _.get(result, ['items', '0', 'contentDetails', 'relatedPlaylists', 'uploads'])
}

async function getVideos(id, token='') {
    const playlistId = await getVideoPlaylist(id)
    const url = `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${KEY}` 
                + (token ? `&pageToken=${token}` : '')
    const result = await Cache(url, {
        duration: '1d',
        type: 'json',
        ...cacheOptions
    })

    let allVideos = _.map(_.get(result, 'items'), function(data){
        return {
            id: _.get(data, ['snippet', 'resourceId', 'videoId']),
            title: _.get(data, ['snippet', 'title']),
            description: _.get(data, ['snippet', 'description']),
            date: _.get(data, ['snippet', 'publishedAt']),
            channel: _.get(data, ['snippet', 'channelTitle']),
            channelId: _.get(data, ['snippet', 'channelId'])
        }
    })

    if (_.has(result, 'nextPageToken')) {
        const token = _.get(result, 'nextPageToken')
        return allVideos.concat(await getVideos(id, token))
    } else {
        return allVideos
    }
}

function getAllVideos() {
    return new Promise((resolve, reject) => {
        const sources = SOURCES
        let promises = []
        let data = []
        sources.forEach(function(source){
            promises.push(new Promise((resolve, reject) => {
                getVideos(source)
                .then((result) => {
                    data.push(result)
                    resolve()
                })
                .catch(reject)
            }))
        })
        Promise.all(promises)
        .then(() => resolve(_.orderBy(_.flattenDeep(data), 'date', 'desc')))
        .catch(reject)
    })
}

module.exports = getAllVideos()
    .then(result => {return result})
    .catch(e => console.error(e))