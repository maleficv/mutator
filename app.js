const express = require('express');
const request = require('request');
const sharp = require('sharp');
const multer = require('multer');
const upload = multer();

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/resize', function (httpRequest, httpResponse) {
    const {url, width = 1920, height = null, format} = httpRequest.query;
    const resizedImage = resizeStream(width, height, format);

    const inputType = url.match('.png|.jpg|.jpeg')[0];
    const outputType = inputType.split('.')[1];

    httpResponse.set('Content-Type', `image/${outputType}`);

    request
        .get(url)
        .on('error', () => {
            httpResponse.send('There was an error with downloading an image');
        })
        .pipe(resizedImage)
        .pipe(httpResponse);

});

app.post('/resize', upload.single('url'), function (httpRequest, httpResponse) {
    const {file} = httpRequest;
    const {buffer} = file;
    const {width = 1920, height = null, format} = httpRequest.body;

    const inputType = file.originalname.match('.png|.jpg|.jpeg')[0];
    const outputType = inputType.split('.')[1];

    httpResponse.set('Content-Type', `image/${outputType}`);

    const resizedImage = resizeBufferPromise(buffer, width, height, format);

    resizedImage.then((buffer) => {
        httpResponse.end(buffer);
    });

});

function resizeStream(width, height, format) {
    let output = sharp();

    if (width && !height) { output.resize(parseInt(width)) }
    if (height && height) { output.resize(parseInt(width), parseInt(height))}

    if (format === 'jpeg') output.jpeg();
    if (format === 'png') output.png();

    return output;
}

function resizeBufferPromise(buffer, width, height, format) {
    let output = sharp(buffer);

    if (width && !height) { output.resize(parseInt(width)) }
    if (height && height) { output.resize(parseInt(width), parseInt(height))}

    if (format === 'jpeg') output.jpeg();
    if (format === 'png') output.png();

    output.toBuffer();

    return output;
}

app.listen(process.env.PORT || 8000);