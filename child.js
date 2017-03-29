var filewalker = require('filewalker');

process.on('message', function(message) {
    //    console.log('[child] received message from server:', message.dir);
    var item = message.dir
    return new Promise(function(resolve, reject) {
        filewalker(item)
            .on('dir', function(p) {

            })
            .on('file', function(p, s) {

            })
            .on('error', function(err) {
                //    console.log(err)
                return reject;
            })
            .on('done', function() {
                var self = this;
                setTimeout(function() {
                    resolve({
                        dirs: self.dirs,
                        files: self.files,
                        bytes: self.bytes,
                        count: self.count,
                    });
                    //         console.log(item + ' encryptable files: ' + self.count)
                    process.send({
                        child: process.pid,
                        result: item + ' ' + self.count
                    });
                    // process.();
                }, 1000)


            })
            .walk();
    })

});
