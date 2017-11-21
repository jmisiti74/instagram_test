//api containing id and secret to get a new token at every time
const api = require('instagram-node').instagram();
//ig containing access token for all requests
const ig = require('instagram-node').instagram();
//a bollean to know if access token input is filled or not
let accessToken = false;
//variables.env containing client id and secret
require('dotenv').config({ path: 'variables.env' });
const redirect_uri = 'http://localhost:8080/return';
const countLikes = (medias) => {
  let i = 0;
  let likes = 0;
  const now_s = Math.floor(Date.now() / 1000);
  medias.forEach((media) => {
    //Looking if post is older than 2 month
    //5257000 equals 2 months in seconds
    if ((now_s - media.created_time) < 5257000) {
      i++;
      likes += media.likes.count;
    }
  });
  return ((likes == 0 || i == 0) ? 0 : likes / i);
};

api.use({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET
});

//getting the authorization from instagram api
exports.authorize_user = (req, res) => {
  res.redirect(api.get_authorization_url(redirect_uri, { scope: ['public_content'], state: 'state' }));
};

//saving access token to send requests
exports.handle_auth = (req, res) => {
  api.authorize_user(req.query.code, redirect_uri, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      accessToken = true;
      ig.use({
        access_token: result.access_token
      });
      res.redirect('/');
    }
  });
};

//Checking if access token exist
exports.is_access_token = (req, res, next) => {
  if (accessToken == true)
    return next();
  else
    res.redirect('/login');
}

//show the index page containing the form
exports.show_form = (req, res) => {
  res.render('index', {
		title: 'Home'
	});
};

//Get likes per posts from instagram api
exports.get_lpp = (req, res) => {
  if (req.body && req.body.username) {
    ig.user_search(req.body.username, (err, users, remaining, limit) => {
      if (err) {
        res.send(`${err}`)
      } else if (users[0] != null) {
        ig.user_media_recent(users[0].id.toString() , (err, medias, pagination, remaining, limit) => {
          if (err) {
            res.send(`${err}`)
          } else {
            res.send(`<b>${req.body.username}</b> : ${countLikes(medias).toString()} likes / post<br /><br /><a href='/'>Try again</a>`);
          }
        });
      } else {
        res.send('User is not a sandbox user..');
      }
    });
  } else {
    res.send('please fill username input');
  }
};
