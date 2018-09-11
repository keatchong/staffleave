'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const API_KEY = require('./apiKey');
const crypto = require('crypto');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.post('/get-leave-balance', (req, res) => {
	console.log('Request headers: ' + JSON.stringify(req.headers));
	console.log('Request body: ' + JSON.stringify(req.body));

	const parameters = req.body.queryResult.parameters;
	const outputContexts = req.body.queryResult.outputContexts;
	console.log('parameters ==========>' +  JSON.stringify(parameters));
	console.log('InputContexts ==========>' +  JSON.stringify(outputContexts));
	
	dispatchHandler(req,res)
	
});


function dispatchHandler(req,res) {
	let action = req.body.queryResult.intent.displayName;
	console.log('action ==========>' +  action);
	
	if ( action == 'hr.leave.enquiry') {
		getLeaveBalance(req,res);	
	} else if ( action == 'hr.login') {
		login(req,res); 
	}  	
		
}

function login(req,res) {
	
	const userId = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.userid? req.body.queryResult.parameters.userid: 'Unknown';
	console.log(userId);
	
	const passWord = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.password? req.body.queryResult.parameters.password: 'Unknown';
	
	const sessionId =  req.body.session ? req.body.session: 'Unknown';
	

	
	console.log("UserId ===> " +  userId);
	console.log("Password ===> " +  passWord);
	
	const reqUrl = encodeURI(`http://175.136.114.174:8080/web-student-tracker/rest/student/signOn/${userId}/${passWord}`);
	console.log(reqUrl);
    
	http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const token = completeResponse;
			console.log("Token ===> " + token);
            //let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : '';
            return res.json({
                fulfillmentText: 'Login Success !!',
                source: 'login',
				outputContexts: [{"name": sessionId+"/contexts/"+"login-authenticated", "lifespanCount":50, "parameters":{"token":token}}]
				
            });
        });
    }, (error) => {
        return res.json({
            fulfillmentText: 'Login Failed !!',
            source: 'login'
        });
    });

		
	

}


	
function getLeaveBalance(req,res) {

	const staffToSearch = req.body.queryResult && req.body.queryResult.parameters && req.body.queryResult.parameters.staffno ? req.body.queryResult.parameters.staffno : 'Unknown';
    console.log(staffToSearch);
	const secret = 'secret';
	const hash = crypto.createHmac('sha256', secret)
                   .update('Message')
                   .digest('base64');
	console.log(hash);
	const reqUrl = encodeURI(`http://175.136.114.174:8080/web-student-tracker/rest/student/${hash}/${staffToSearch}`);
	console.log(reqUrl);
    
	http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const staff = JSON.parse(completeResponse);
            //let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : '';
            let dataToSend = `Leave Balance for Staff ${staff.firstName} is ${staff.leaveBalance}`;
            return res.json({
                fulfillmentText: dataToSend,
                source: 'get-leave-balance'
				
            });
        });
    }, (error) => {
        return res.json({
            fulfillmentText: 'Something went wrong!',
            source: 'get-leave-balance'
        });
    });

	
}	


server.listen((process.env.PORT || 8000), () => {
    console.log("Server is up and running...");
});