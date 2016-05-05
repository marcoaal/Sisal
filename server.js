var http = require('http');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var session = require('express-session');

var app = express();

AWS.config.loadFromPath('./config.json');

app.set('port',process.env.PORT || 3000);

app.use(express.static(__dirname+'/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
	secret: "1234"
}));


var config = fs.readFileSync('./app_config.json','utf8');
config = JSON.parse(config);

var db = new AWS.DynamoDB({region: config.AWS_REGION});

app.get('/',function(req,res){
	res.sendFile('index.html');
});



app.post('/registro', function(req, res){
	var usernameCampo = req.body.username,
		correoCampo = req.body.correo,
		edadCampo = req.body.edad,
		passwordCampo = req.body.password,
		puestoCampo = req.body.puesto;
		res.send(200);	
		registro(usernameCampo,correoCampo,edadCampo,passwordCampo,puestoCampo);
});

app.post('/sigin', function(req,res){
	var usernameCampo = req.body.username,
		passwordCampo = req.body.password;
		sigin(usernameCampo,passwordCampo);
});


/*Checar sintaxis de getitem
	ReferenceError: passwordR is not defined
*/
var sigin = function(usernameR,correoR){
	var datos= {
		AttributesToGet:[
			usernameR,passwordR
		],
		TableName: config.REGISTRO_SISAL,
		Key:{
			username:{'S': usernameR},
			password:{'S': passwordR}
		}
	};
	db.getItem(datos,function(err,data){
		if(err){
			console.send('Los atributos no concuerdan en la db', err);
		}
		else{
			console.send("Atributos encontrados en la db");
		}
	});

};

var registro = function(usernameR, correoR, edadR, passwordR, puestoR) {
	var datos = {
		TableName: config.REGISTRO_SISAL,
		Item: {
			username: {'S': usernameR},
			correo: {'S': correoR},
			edad: {'S': edadR},
			password: {'S': passwordR},
			puesto: {'S': puestoR}
		}
	};
	db.putItem(datos, function(err,data){
		if(err){
			console.log('Error al añadir tupla a la base de datos: ', err);
		}
		else{
			console.log("Datos agregados a la base de datos");
		}
	});
};

http.createServer(app).listen(app.get('port'), function(){
  console.log('Servidor express escuchando en el puerto ' + app.get('port'));
});