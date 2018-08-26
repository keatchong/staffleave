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

    const staffToSearch = req.body.result && req.body.result.parameters && req.body.result.parameters.staffno ? req.body.result.parameters.staffno : 'Unknown';
    console.log(staffToSearch);
	const secret = 'secret';
	const hash = crypto.createHmac('sha256', secret)
                   .update('Message')
                   .digest('base64');
	console.log(hash);
	const reqUrl = encodeURI(`http://169.254.79.71:8080/web-student-tracker/rest/student/${hash}/${staffToSearch}`);
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
                speech: dataToSend,
                displayText: dataToSend,
                source: 'get-leave-balance'
            });
        });
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-leave-balance'
        });
    });
});

server.listen((process.env.PORT || 8000), () => {
    console.log("Server is up and running...");
});