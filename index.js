var child_process = require('child_process');
const filewalker = require('filewalker');
const fs = require('fs');
const _ = require('lodash');
const path = require('path')
const exec = require('child_process').exec;
var readdir = require('readdir-absolute');
var numchild = require('os').cpus().length;
var pdf = require('pdfkit')

///////////////////
/////////////////




/////////////////////
///////////////////////
var dateExecuted = new Date();

var year = dateExecuted.getFullYear();


var month = dateExecuted.getMonth();
var day = dateExecuted.getDate();
var displayDate = month + '/' + day + '/' + year;

// add full array of the alphabet
const srcpath = ['a:/', 'b:/', 'c:/', 'd:/', 'e:/', 'f:/', 'g:/', 'h:/', 'i:/', 'j:/', 'k:/', 'l:/', 'm:/', 'n:/', 'o:/', 'p:/', 'q:/', 'r:/', 's:/', 't:/', 'u:/', 'v:/', 'w:/', 'x:/', 'y:/', 'z:/'];

var ignore = [".sys", "dev", "Users", "Program Files", "ProgramData", "Windows", "Cache", "AppData", "$WINDOWS", "$SysReset", "$RECYCLE.BIN", "System Volume Information"];

var promises = srcpath
    .map(getFilesInDirectory);


var execute;

function control() {
    Promise
        .all(promises.map(reflect))
        .then((results) => {
            return results.filter(x => x.status === 'resolved').map(x => x.v)
                // console.log(results)
        })
        .then((jagged) => {
            return _.flatten(jagged);
            //  console.log(jagged)
        })
        .then((roots) => {
            //  console.log(roots)
            return distribute(roots);

        }).then((forResolve) => {
            var { resultArray, roots } = forResolve
            return secondMethod(roots, resultArray)
        }).then((data) => {
            var { exArr, resultArray } = data
            //  console.log('hey', resultArray)

            return stringy(resultArray, exArr);
        }).then((data) => {
            var { exStr, str } = data
            return pdfy(str, exStr);
        })
}

function reflect(promise) {
    return promise.then(function(v) {
            return { v: v, status: "resolved" }
        },
        function(e) {
            return { e: e, status: "rejected" }
        });
}

function getFilesInDirectory(directory) {
    return new Promise(function(resolve, reject) {
        readdir(directory, function(err, roots) {
            if (err) {
                //     console.log(err)
            }

            roots = _.differenceWith(roots, ignore, function(a, b) {
                return a.includes(b);
            });

            resolve(roots);
        });
    });
};

var done = 0;
//////////////////
// roots = array of folders
// var val = roots.length / num of cpus
// loop through roots and pop val from roots
//////////////////
var distribute = function(roots) {
    return new Promise(function(resolve, reject) {

        var proccessors = numchild
            //   console.log(proccessors)
        var child = [];
        var resultArray = [];
        for (var i = 0; i < proccessors; i++) {

            child[i] = child_process.fork('child.js');

            child[i].on('message', function(message) {
                //      console.log('[parent] received message from child:', message);
                var ul = document.getElementById("encryptable");
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(message.result));
                ul.appendChild(li);
                done++;
                resultArray.push(message.result)
                if (done === roots.length) {
                    console.log('[parent] received all results');
                    console.log("!!!!!!!!!!!!!!!!", roots)
                    var forResolve = { resultArray, roots }
                    return resolve(forResolve);

                }
            })
            child[i].on('error', function(err) {
                return reject(err);
            })

        }
        roots.forEach(function(dir, index) {
            child[index % proccessors].send({ dir: dir })
        })
    });


}



/////////////////////////////////
////////////////////////////////
//////////////////////////////////


var secondMethod = function(roots, resultArray) {
    var exArr = [];
    //  console.log("!!!!!!!!!!!!!!!", roots)
    return new Promise(function(resolve, reject) {
        var promises = roots.map(function(item) {
                //           console.log(item)
                return new Promise(function(resolve, reject) {
                    exec('icacls ' + '"' + item + '"', (error, stdout, stderr) => {
                        if (error) {
                            //               console.error(`exec error: ${error}`);
                            return reject();
                        }
                        //          console.log(`stdout: ${stdout}`);
                        var directoryPermission = stdout
                        var exePermissionBool = directoryPermission.includes("(OI)(CI)(DENY)(RX)")
                        var writePermissionBool = directoryPermission.includes("(DENY)(W)")
                            //           console.log("does not allow exe " + exePermissionBool)
                            //          console.log("does not allow write " + writePermissionBool)
                        if (exePermissionBool == false || writePermissionBool == false) {
                            var ul = document.getElementById("executable");
                            var li = document.createElement("li");
                            li.appendChild(document.createTextNode(item));
                            ul.appendChild(li);
                            exArr.push(item);

                        }
                        resolve();
                    });
                })

            })
            // roots.forEach(function(item) {
            // })
        Promise.all(promises).then(function() {
            var data = { exArr, resultArray }
            return resolve(data);
            // console.log(exArr)
            // execute = exArr.join("\n");
            // console.log("testinggggggg " + typeof(execute))
        })
    })


}


var stringy = function(arr, exArr) {
        return new Promise(function(resolve, reject) {
            var exStr = exArr.join('\n')
                //   console.log("bare", arr)
            var str = arr.join('\n')
                //   console.log("joined", str);
            var data = { exStr, str }
            return resolve(data)
        })

    }
    //////////////////////////////
    ///////////////////////////////
    ////////////////////////////////
var pdfy = function(encrypted, executed) {
    var myDoc = new pdf;
    myDoc.pipe(fs.createWriteStream('output.pdf'))

    myDoc.image('FSA-Logo-Standard.png', {
        fit: [500, 700],
        valign: 'center'
    })
    myDoc.lineGap(10)
    myDoc.lineBreak = false
    myDoc.fill = false
    myDoc.font('Helvetica')
        .fontSize(40)
        .text('Assessment Report', 130)
    myDoc.font('Helvetica')
        .fontSize(25)
        .text("Execution Locations: Your organization is at risk because Ransomware would be able to successfully execute in the following files and folders: ", 20)
    myDoc.font('Helvetica')
        .fontSize(15)
        .fillColor('red')
        .text(executed)
    myDoc.font('Helvetica')
        .fontSize(25)
        .fillColor('black')
        .text("Hansomware was able to successfully confirm that Ransomware would have encrypted the following folders and files: ")
    myDoc.font('Helvetica')
        .fontSize(15)
        .fillColor('red')
        .text(encrypted)
    myDoc.fillColor('blue')
    myDoc.text('learn about FSA', {
        align: 'center',
        link: "https://freedomalliance.com/"
    })
    myDoc.end();
    document.getElementById("loading").innerHTML = ''
    document.getElementById("results").style.display = 'block';
}
