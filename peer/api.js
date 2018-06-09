const express = require('express')
// const router = express.Router()

const app = express()
var ctr = 1;
app.get('/addUrl', (req, res) => {
    const url = req.query.url.trim();
    var filename = url.split('/').slice(-1)[0];
    var http = require('https');
    var fs = require('fs');
    
    var file = fs.createWriteStream(filename);
    var request = http.get(url, function(response) {
    response.pipe(file);
    });

    res.status(200).json({success: true, url: url, filename: filename});
});

app.listen(3005, () => console.log('Example app listening on port 3005!'))
