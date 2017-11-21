const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const instagram = require('./Controllers/instagramController');

app.set('port', 8080);
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
  extended: true
}));

//get user authorization
app.get('/login',
  instagram.authorize_user
);

//get access token for all requests
app.get('/return',
  instagram.handle_auth
);

//show likes per post result
app.post('/',
  instagram.get_lpp
);

//detect if access token exist then show username form
app.get('/',
  instagram.is_access_token,
  instagram.show_form
);

//Server listening
http.createServer(app).listen(app.get('port'), function(){
  console.log(`Express server listening on port ${app.get('port')}`);
});
