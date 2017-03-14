var filewalker = require('filewalker');
var fs = require('fs');


var allDir = [];
var allFiles = [];

function exit() {
    window.close();
}

function createFile() {


    fs.writeFile('app/output.txt', 'Your results:', function(err) {
        if (err) throw err;
        console.log('It\'s saved! in same location.');

    });
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 10);

    function frame() {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
        }
    }
    filewalker('c:/dev/weatherApp')
        .on('dir', function(p) {

            //console.log('dir:  %s', p);

            //console.log(allDir);


            allDir.push({ 'directory': p })


        })
        .on('file', function(p, s) {
            // console.log('file: %s, %d bytes', p, s.size);
            // allFiles.push(p)
            allFiles.push({ 'file': p })
            console.log(allFiles)


        })
        .on('error', function(err) {
            console.error("TEST TEST", err);
        })
        .on('done', function() {
            console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
            createFileLink();

        })
        .walk();
    console.log(allDir)
    console.log(allFiles)


}

function createFileLink() {
    document.getElementById("seeResults").innerHTML = '<a  class="button" download href="app/output.txt"> results </a>';
}

// function main() {

//     // fs.writeFile('output.txt', 'Your results:', function(err) {
//     //     if (err) throw err;
//     //     console.log('It\'s saved! in same location.');
//     // });

//     filewalker('c:/dev/weatherApp/app')
//         .on('dir', function(p) {

//             //console.log('dir:  %s', p);

//             //console.log(allDir);


//             allDir.push({ 'directory': p })


//         })
//         .on('file', function(p, s) {
//             // console.log('file: %s, %d bytes', p, s.size);
//             // allFiles.push(p)
//             allFiles.push({ 'file': p })
//             console.log(allFiles)


//         })
//         .on('error', function(err) {
//             console.error("TEST TEST", err);
//         })
//         .on('done', function() {
//             console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
//         })
//         .walk();

//     console.log(allDir)
//     console.log(allFiles)
// }
