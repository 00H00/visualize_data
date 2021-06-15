const http = require('http');
const fs   = require('fs');
const path = require('path');

// minetyeの定義（使う分だけ）
const mineTypes = {
	'.html' : 'text/html',
	'.js'   : 'text/javascript',
	'.css'  : 'text/css'
};
const port = 80

http.createServer(function(req,res){

	console.log('request ' , req.url);

	var filepath = '.' + req.url;
	if(filepath == './'){
		filepath = './index.html';
	}
	
	let extname = String(path.extname(filepath)).toLowerCase();
	let contentType = mineTypes[extname];

	fs.readFile(filepath, function(err,content) {
		if(err){
			res.writeHead(200,{ 'Content-Type' : 'text/html' });
			res.write('Error');
			res.end();
		}else{
			res.writeHead(200, {'Content-Type': contentType });
			res.end(content,'utf-8');
		}
	});
}).listen(port);

console.log('Server running at http://127.0.0.1:',port);
