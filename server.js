const express = require('express')
const app = express()
const port = process.env.PORT
require('dotenv').config()
var cors = require('cors')
var GetPocket = require('node-getpocket');
var request = require('request');


app.use(express.json());
var corsOptions = {
  origin: process.env.EXTENSION_URL,
  optionsSuccessStatus: 200
}
app.options('*', cors(corsOptions), function (req, res) {
  res.send('OK');
})

// Config for Pocket API
var config = {
  consumer_key: process.env.POCKET_CONSUMER_KEY,
  redirect_uri: process.env.REDIRECT_URL
};
var pocket = new GetPocket(config);
var params = {
  redirect_uri: config.redirect_uri
};


app.post('/api/pocket', cors(corsOptions), function (req, res) {
  var headers = {
    'Content-Type': 'application/json',
    'X-Accept': 'application/json'
  };
  var accessToken = req.body.access_token;
  if (req.body.type == 'getitems' && accessToken) {
    var dataString = JSON.stringify({
      "consumer_key": process.env.POCKET_CONSUMER_KEY,
      "access_token": accessToken
    });
    var options = {
      url: 'https://getpocket.com/v3/get',
      method: 'POST',
      headers: headers,
      body: dataString
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      }
      else if (error) {
        console.log(error);
        res.send("{message: 'Error'}");
      }
      else {
        res.send(body);
      }
    }
    request(options, callback);
  }
  else if (req.body.type == "getRequestToken") {
    pocket.getRequestToken(params, function (err, resp, body) {
      if (err) {
        console.log('getTokenRequest failed: ' + err);
      }
      else {
        //request token is in body.code
        res.send(body);
      }
    });
  }
  else if (req.body.type == "getAccessToken" && req.body.request_token) {
    var paramsrequestToken = {
      request_token: req.body.request_token
    };
    pocket.getAccessToken(paramsrequestToken, function (err, resp, body) {
      if (err) {
        console.log('getAccessToken failed: ' + err);
      }
      else {
        res.send(body);
      }
    });
  }
  else if (req.body.type == "archiveItem" && req.body.access_token && req.body.item_id != 'null' && req.body.item_id) {
    var headers = {
      //'Content-Type': 'application/json',
      'X-Accept': 'application/json'
    };
    var dataString = JSON.stringify({
      "consumer_key": process.env.POCKET_CONSUMER_KEY,
      "access_token": accessToken,
      "action": "archive",
      "item_id": req.body.item_id
    });
    var options = {
      url: `https://getpocket.com/v3/send?actions='${encodeURIComponent('[{"action" : "archive", "item_id" :' + req.body.item_id + '}]')}&access_token=${accessToken}&consumer_key=${process.env.POCKET_CONSUMER_KEY}`,
      method: 'POST',
      headers: headers,
    };
    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      }
      else if (error) {
        console.log(error);
        res.send("{message: 'Error'}");
      }
      else {
        res.send(body);
      }
    }
    request(options, callback);
  }
  else {
    res.send('{message:"No data"}');
  }

})

app.post('/api/asana', cors(corsOptions), function (req, res) {


  if (req.body.type == 'getaccessToken' && req.body.code) {
    var dataString = `grant_type=authorization_code&code=${req.body.code}&client_id=${process.env.ASANA_CLIENTID}&client_secret=${process.env.ASANA_CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT_URL}`;

    var options = {
      url: 'https://app.asana.com/-/oauth_token',
      method: 'POST',
      headers: {
        'Content-Length': dataString.length,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'curl/7.52.1'
      },
      body: dataString
    };

    function callback(error, response, body) {
      res.send(body);
    }

    request(options, callback);

  }
  else if (req.body.type == 'refreshToken' && req.body.refreshtoken) {
    var dataString = `grant_type=refresh_token&refresh_token=${req.body.refreshtoken}&client_id=${process.env.ASANA_CLIENTID}&client_secret=${process.env.ASANA_CLIENT_SECRET}&redirect_uri=${process.env.REDIRECT_URL}`;

    var options = {
      url: 'https://app.asana.com/-/oauth_token',
      method: 'POST',
      headers: {
        'Content-Length': dataString.length,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'curl/7.52.1'
      },
      body: dataString
    };

    function callback(error, response, body) {
      res.send(body);

    }

    request(options, callback);
  }
  else {
    res.send('{"message": "No data"}');
  }


});

app.post('/api/wunderlist', cors(corsOptions), function (req, res) {
  if (req.body.code) {
    var dataString = JSON.stringify({
      "client_id": process.env.WUNDERLIST_CLIENTID,
      "client_secret": process.env.WUNDERLIST_CLIENT_SECRET,
      "code": req.body.code
    });

    var headers = {
      'Content-Type': 'application/json',
      'Content-Length': dataString.length,
      'User-Agent': 'curl/7.52.1'
    };

    var options = {
      url: 'https://www.wunderlist.com/oauth/access_token',
      method: 'POST',
      headers: headers,
      body: dataString
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {

        res.send(JSON.stringify(body));
      }
      else {
        res.send(JSON.stringify(body));
      }
    }

    request(options, callback);
  }
  else {
    res.send('{"message": "No data"}');
  }

})

app.post('/api/todoist', cors(corsOptions), function (req, res) {

  if (req.body.code) {
    var dataString = `client_id=${process.env.TODOIST_CLIENTID}&client_secret=${process.env.TODOIST_CLIENT_SECRET}&code=${req.body.code}&redirect_uri=${process.env.REDIRECT_URL}`;
    var options = {
      url: 'https://todoist.com/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Length': dataString.length,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'curl/7.52.1'
      },
      body: dataString
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(JSON.stringify(body));
      }
      else {
        res.send(JSON.stringify(body));
      }
    }

    request(options, callback);
  }
  else {
    res.send('{"message": "No data"}');
  }


});

app.post('/api/github', cors(corsOptions), function (req, res) {

  if (req.body.code) {
    var dataString = JSON.stringify({
      "client_id": process.env.GITHUB_CLIENTID,
      "client_secret": process.env.GITHUB_CLIENT_SECRET,
      "code": req.body.code
    });
    var options = {
      url: 'https://github.com/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Length': dataString.length,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'curl/7.52.1'
      },
      body: dataString
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(JSON.stringify(body));
      }
      else {
        res.send(JSON.stringify(body));
      }
    }

    request(options, callback);
  }
  else {
    res.send('{"message": "No data"}');
  }


});

app.listen(port, () => console.log(`API server listening on port ${port}`))



