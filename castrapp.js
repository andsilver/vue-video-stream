const path = require('path');
const os = require('os')
const fs = require('fs');

// 
// Configuration 
// 

const config = {

  // www root
  root: 'dist',

  // default file to serve
  index: 'index.html',

  // http listen port
  port: process.env.PORT || 3000

};


// 
// HTTP Server
// 

require('http').createServer(function(request, response) {
  var file = path.normalize(config.root + request.url);

  // const isViewTemplate = !/^\/static/gi.test(request.url)
  // if (isViewTemplate)
  //   file = config.root + '/' + config.index

  file = (file == config.root + '/' || file == config.root + '\\') ? file + config.index : file;

  console.log('Trying to serve: ', file);

  function showError(error) {
    console.log(error);

    response.writeHead(500);
    response.end('Internal Server Error');
  }

  fs.exists(file, function(exists) {
    if (exists) {
      fs.stat(file, function(error, stat) {
        var readStream;

        if (error) {
          return showError(error);
        }

        if (stat.isDirectory()) {
          response.writeHead(403);
          response.end('Forbidden');
        } else {
          readStream = fs.createReadStream(file);

          readStream.on('error', showError);

          response.writeHead(200);
          readStream.pipe(response);
        }
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
  });

}).listen(config.port, function() {
  console.log('Server running at http://localhost:%d', config.port);
});
