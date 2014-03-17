//
// index -- Main web page for Dial-A-Geddon website
//
// Copyright (C) 2011-2011 Tactile Interactive Software Inc.
// All Rights Reserved
//

/* bug / wish list
- responsive design!  Make it usable on a phone.
- target choosing form: make text sizes bigger and follow the overall font size
- prefs - improve graphically
*/

var util = require('util'),
	fs = require('fs'),
	hogan = require('hogan.js'),
	http = require('http'),
	stylus = require('stylus'),
	child_process = require('child_process'),
	templateFiles = {}, templatePartials, 
	staticFiles, jsFiles, webjs, totalHTML, 
	partialsDone = false, jsDone = false,
	httpPort = 8201;

// we use a lot of pathnames relative to here
process.chdir(__dirname);

// some fatal error in this file
function serverBomb(err) {
	if (typeof err == 'string')
		console.error(err);
	else {
		console.error("%s: %s", err.name || '', err.message || '');
		console.dir(err);
	}
	process.exit(9);
}

////////////////////////////////////////////////////// serving

// send out this request, easy.  bytes = a string (utf8) or a buffer (bin, images)
function sendIt(ans, bytes, mime) {
	var headers = {
		'Content-Type': mime, 
	};
	
	////if (productionMode)
		headers['Cache-Control'] = 'max-age=86400';   // please re-fetch after 1 day
	
	ans.writeHead(200, headers);
	ans.end(bytes);
	console.log("sent %s type file, %s bytes", mime, bytes && bytes.length || 'no bytes?');
}

var suffixToMime = {
	png: 'image/png',
	gif: 'image/gif',
	ico: 'image/x-icon',
	html: 'text/html',
	css: 'text/css'
};


function geddonCGI(queryString, onDone) {
	var env = {};
	for (var k in process.env)
		env[k] = process.env[k];
	env['QUERY_STRING'] = queryString;

	var geddon = child_process.spawn(__dirname + '/geddon', [], {env: env});
	// must handle events error, exit, close
	var sout = '', serr = '';
	geddon.stdout.on('data', function(data) {
		sout += data.toString();
	});
	geddon.stderr.on('data', function(data) {
		serr += data.toString();
	});
	geddon.on('close', function(rc, sig) {
		onDone(sout, serr);
	});
	geddon.on('error', function(er) {
		console.error("Error from geddon: %j", er);
		onDone('', er.message);
	});
}

function serve() {
	// ALL of the loads must be done for this to be done correctly, and once
	// (honestly, what diff does it make?  while we're waiting, requests fail always instead of sometimes.)
	http.createServer(function serv1(quest, ans) {
	
		// pictures and everything goes thru here, although the urls
		// don't have the directory names we keep them under.  Works anyway.
		var fName = quest.url.replace(/^.*\//, '');
		var suffix = fName.replace(/^.*\./, '');
		if (fName == '') {
			// THE main page itself
			sendIt(ans, totalHTML, 'text/html');
		}
		else if (suffixToMime[suffix])
			sendIt(ans, staticFiles[fName], suffixToMime[suffix]);
		else if (suffix == 'js')
			sendIt(ans, jsFiles[fName], 'application/javascript');
		else if (/^geddon\?/.test(fName)) {
			// pretend to cgi  start with this
			geddonCGI(fName.split('?')[1], function onDone(out, err) {
				if (err)
					ans.end(err);
				else
					ans.end(out);
			});
		}
		else {
			ans.writeHead(404, {'Content-Type': 'text/html'});
			ans.end(fName +' not found');
		}
	}).listen(httpPort);

	console.log('Server running at http://localhost:'+ httpPort +'/');
}

////////////////////////////////////////////////////// preloading

// checks if everything's loaded, then actually starts the server 
function maybeServe(p, j) {
	// ALL of the loads must be done for this to be done correctly, and once
	partialsDone |= p;
	jsDone |= j;
	if (!partialsDone || !jsDone)
		return;

	// now do some last minute prep to put it all together
	completePreloads();

	serve();
}

function loadAFile(fileName, filePath, dictToAddTo, callback) {
	// binary or text?
	var options = fileName.search(/\.(png|gif|ico|jpg)$/i) >= 0 ? {} : {encoding: 'utf8'};
	console.log("fn: (%s)  searchres: %j %j %j", fileName, fileName.search(/\.(png|gif|ico|jpg)$/i), fileName.search(/\.(png|gif|ico|jpg)$/i) >= 0, options);////
	
	fs.readFile(filePath, options, function reread(er, bytes) {
		if (er)
			serverBomb("error reloading: %s: %j", fileName, er);
		dictToAddTo[fileName] = bytes;  // a string OR a buffer if a binary file
		console.log("%s: loaded %s, %d bytes, text? %j", (new Date()).toLocaleTimeString(), fileName, bytes.length, options);

		if (callback)
			callback(fileName);

	});
}

// given a directory name in same dir as this file, read in all files in that dir.
// After the last one is read, call uponDone(dict) where the dict key is the filename
// and the value is the entire contents.
// Also, if in dev mode, watch each file and reread if it changed, calling uponReread(fileName)
function loadWholeDirectory(dirName, dictToAddTo, uponDone, uponReload) {
	fs.readdir(dirName, function dirread(er, fileNames) {
		// the dictToAddTo has been initialized by our caller; 
		// can't do it in here cuz it's got to hold return value.

		// .DS_Store and others - skip over of course
		while (fileNames[0][0] == '.')
			fileNames.shift();
		var starts = fileNames.length;
		
		fileNames.forEach(function aName(fileName) {
			var filePath = dirName +'/'+ fileName;

			loadAFile(fileName, filePath, dictToAddTo, function(fn) {
					if (--starts <= 0 && uponDone)
						uponDone(fn);
				});
			////fs.readFile(filePath, function itsBytes(er, bytes) {
			////	// read-one-file callback.
			////	// each one completes at random, just make sure you got them all
			////	if (er)
			////		serverBomb(er);
			////	dictToAddTo[fileName] = bytes;
			////	console.log("Loaded %s, %d bytes", fileName, bytes.length);
			////	if (--starts <= 0 && uponDone)
			////		uponDone(dictToAddTo);
			////});
			
			// now, set a watch on that file to update it if it changes, if i'm debugging
			if (! productionMode) {
				// ignore event and fName; docs say theyre unreliable
				fs.watch(filePath, function catchAChange(event, fName) {
					loadAFile(fileName, filePath, dictToAddTo, uponReload);
				});
			}
			
			
		});
	});
}

// ok finish it up; convert the loaded files  into something useful
function completePreloads() {
	////////////////////////////////// JavaScript
	// assemble JS section, either direct JS or <script tags.
	// backbone uses underscore during initial run. and jquery.  
	// conclusion needs verse and formula loaded first.  etc.
	// load in numerical order.
	var jsSequence = Object.keys(jsFiles);
	jsSequence.sort(function sortOrder(a, b) {return a > b});
	
	// convert jsSequence array and jsFiles dict into the webjs insertion in html
	webjs = jsSequence.map(function nameToContent(fname) {
		// in production, we inject the JS directly into the downloaded html.
		// in dev, we keep them separate in the debugger.
		if (productionMode) 
			return "\n/* ================"+ fname +" */\n"+
				jsFiles[fname].toString();
		else
			return util.format("<script src=%s></script>\n", fname);
	}).join('\n');
	if (productionMode) 
		webjs = '<script>\n'+ webjs +'</script>\n';  // cuz it's all javascript!!

	////////////////////////////////// hogan templates
	// compile them into a big html glob including webjs
	templatePartials = {};
	for (tplName in templateFiles)
		templatePartials[tplName] = hogan.compile(templateFiles[tplName].toString());
	totalHTML = templatePartials['main.mustache'].render({webjs: webjs}, templatePartials);
	
	console.log('completed preloads');
}

// precompile templates into the templateFiles obj.  
function preloadTemplates() {
	templateFiles = {};
	loadWholeDirectory('templates', templateFiles, function aDir(list) {
		maybeServe(true, false);
	}, function cp() {
		completePreloads();
	});
	
}

// collect all the JS files to send into one lump.  
// Note we don't worry about when it'll all be done cuz i'm lazy.  
// As long as they all finish by the time teh first request comes in, it's OK.  
function preloadJS() {
	jsFiles = {};
	loadWholeDirectory('webjs', jsFiles, function jslded(list) {
		maybeServe(false, true);  // preload done
	}, function reco() {
		completePreloads();  // re-read file cuz it changed
	});
	
}

// one file, but the language is cool
function compileStylus() {
	fs.readFile('main.stylus', {encoding: 'utf8'}, function readStylus(er, bytes) {
		if (er)
			serverBomb(er);
			
		stylus.render(bytes.toString(), {filename: 'main.stylus'}, function(er, css){
			if (er)
				serverBomb(er);
			staticFiles['main.css'] = css;  // never an actual file but we pretend
			console.log("Loaded & Compiled main.stylus");
		});
	});
}

// if we read them in right now we can serve them quickly
function loadStatics() {
	staticFiles = {};
	loadWholeDirectory('statics', staticFiles);

	compileStylus();
	
	// now, set a watch on that file to update it if it changes, if i'm debugging
	if (! productionMode) {
		// ignore event and fName; docs say theyre unreliable
		fs.watch('main.stylus', function stylusChange(event, fName) {
			compileStylus();
		});
	}
	
}


////////////////////////////////////////////////////////// main

// development vs release
var productionMode = process.argv[2] != '--dev';

preloadJS();  // start first cuz it takes longer
loadStatics();
preloadTemplates();
