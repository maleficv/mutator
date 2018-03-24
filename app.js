const express = require('express');
const request = require('request');
const sharp = require('sharp');

const app = express();

app.get('/resize', function (httpRequest, httpResponse) {
    const {url, width = 1920, height = 1080, format} = httpRequest.query;
    const resizedImage = resize(width, height, format);

    const inputType = url.match('.png|.jpg|.jpeg')[0];
    const outputType = inputType.split('.')[1];

    httpResponse.set(`Content-Type', 'image/${outputType}`);

    request
        .get(url)
        .on('error', () => {
            httpResponse.send('There was an error with downloading an image');
        })
        .pipe(resizedImage)
        .pipe(httpResponse);

});

function resize(width, height, format) {
    let output = sharp()
        .resize(parseInt(width), parseInt(height));

    if (format === 'jpeg') output.jpeg();
    if (format === 'png') output.png();

    return output;
}

app.listen(process.env.PORT || 8000);