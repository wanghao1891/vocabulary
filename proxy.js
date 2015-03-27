var http = require('http');
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;
var fs = require("fs");
var formidable = require('formidable');
var util = require('util');
var filePath = "/root/workspace/vocabulary/";

function execCommand(res, binary, command){
    command = "cd " + filePath + "data/; petite --script " + command;
    console.log(command);
    exec(command, {maxBuffer: 2000000*1024*200}, function (error, stdout, stderr) {
//        console.log("error" + error);
//        console.log("stdout" + stdout);
//        console.log("stderr" + stderr);
        var content = "";

	if (error === null) {
	    content = stdout;
	}
        res.writeHead(200, contentType);

	console.log(binary);

	if (binary) {
	    res.write(eval(content), "binary");
	    res.end();
	} else {
            res.end(content + '\n');
	}
    });
}

function getFile(url, res){
//    isBinary = true;

//    console.log(url.query);
    fileName = url.query;
    
    switch(fileName.split(".")[1]) {
    case "html":
	contentType={'Content-Type': 'text/html'};
	break;
    case "js":
	contentType = {'Content-Type': 'application/x-javascript'};
	break;
    case "png":
	contentType = {'Content-Type': 'image/png'};
	break;
    case "mp3":
	contentType = {'Content-Type': 'audio/mp3'};
	break;
    case "pdf":
	contentType = {'Content-Type': 'application/pdf'};
	break;
    }

    var command = "file.ss " + filePath + fileName;
    
//    return command;

    fileName = filePath + fileName;
    fs.readFile(fileName, "binary", function(error, file) {
	if(error) {
	    res.writeHead(500, {"Content-Type": "text/plain"});
	    res.write(error + "\n");
	    res.end();
	} else {
	    //console.log(file);
	    res.writeHead(200, contentType);
	    res.write(file, "binary");
	    res.end();
	}
    });

    return command = "";
}

function getArg(url, postData){
    args = [];
    arg = "";
    console.log("url.query: " + url.query);
    if(url.query != null){
	args = url.query.split("&");
    }else if(postData != ""){
	args = postData.split("&");
    }

//    console.log("args: " + args);

    for (i=0;i<args.length;i++) {
//        console.log(args[i]);
        kv = args[i].split("=");
	arg += " " + kv[1];//decodeURIComponent(kv[1]);
    }
    
//    console.log("arg: " + arg);
    return arg;
}

function upload_file(req, res, postData) {
    console.log("upload_file" + postData);
    var form = new formidable.IncomingForm();

    form.uploadDir = filePath + "article/";

    form.parse(req, function(err, fields, files) {
	console.log("parse done.")
	console.log(files);
	console.log(util.inspect({fields: fields, files: files}));
	
	var _dest = form.uploadDir + files.fileName.name;

	var _name = fields.name;
	console.log(_name);

	fs.rename(files.fileName.path, _dest, function (err) {
	    if (err) throw err;
	    console.log('renamed complete');

	    var command = "insert.ss article \"" + _name + "\" \"article/" + files.fileName.name + "\"";
	    var isBinary = false;
	    execCommand(res, isBinary, command);
	});

//	res.writeHead(200, {'content-type': 'text/plain'});
//	res.write('received upload:\n\n');
//	res.end(util.inspect({fields: fields, files: files}));
    });

    /*console.log(postData);
    console.log(postData.length);
    var data = new Buffer(postData.length);
    
    console.log("Buffer: " + Buffer.isBuffer(postData));*/
/*    req.setBodyEncoding('binary');

    var stream = new multipart.Stream(req);
    stream.addListener('part', function(part) {
	part.addListener('body', function(chunk) {
	    var progress = (stream.bytesReceived / stream.bytesTotal * 100).toFixed(2);
	    var mb = (stream.bytesTotal / 1024 / 1024).toFixed(1);

	    sys.print("Uploading "+mb+"mb ("+progress+"%)\015");

	    // chunk could be appended to a file if the uploaded file needs to be saved
	});
    });
    stream.addListener('complete', function() {
	res.sendHeader(200, {'Content-Type': 'text/plain'});
	res.sendBody('Thanks for playing!');
	res.finish();
	sys.puts("\n=> Done");
    });*/
}

function route(req, res, postData) {
    var isBinary = true;
    var url = require('url').parse(req.url);
    var command = url.pathname.split("/")[1];
    
    switch(command) {
    case "file":
	command = getFile(url, res);
	break;
    case "favicon.ico":
	command = "";
	break;
    case "upload":
	isBinary = false;
	command = "";
	upload_file(req, res, postData);
	break;
    default:
	isBinary = false;
	command += ".ss" + getArg(url, postData);
	break;
    }

    if (command != "") {
	execCommand(res, isBinary, command);
    }
}

http.createServer(function (req, res) {
//    console.log(req);
//    url = require('url').parse(req.url);
//    console.log(url);

    command = "";
    contentType = {'Content-Type': 'text/html'};
    isBinary = false;
    var postData = "";

    route(req, res, postData);

    req.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
//      console.log("Received POST data chunk '" + postDataChunk + "'.");
    });

    req.addListener("end", function() {
//	console.log("End.");

//	route(req, res, postData);
    });
}).listen(80, '0.0.0.0');

console.log('Server running at http://0.0.0.0/');
