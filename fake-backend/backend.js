const jsonServer = require('json-server');
const server = jsonServer.create();

const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));

server.use(jsonServer.defaults());
server.use(jsonServer.bodyParser);

/**
 * remove trailing slash
 */
server.use((req, res, next) => {
  req.url = req.url.replace(/\/+$/, '');
  next();
});

/**
 * implements authorization later on
 */
const isAuthorized = () => {
  return true;
};
server.use((req, res, next) => {
  if (isAuthorized(req)) {
    next(); // Continue because request is authorized
  } else {
    res.sendStatus(401);
  }
});

/**
 * set default values for new token
 */
server.use((req, res, next) => {
  if (req.method === 'POST' && req.url === '/tokens') {
    req.body.createdAt = Date.now();
    req.body.active = false;
  }
  next(); // Continue to JSON Server router
});

/**
 * add POST /tokens/:id/activate route
 */
server.use((req, res, next) => {
  let match = /(\/tokens\/[^/]+)\/activate/.exec(req.url);
  if (req.method === 'POST' && match) {
    req.method = 'PATCH';
    req.url = match[1];
    req.body = {
      active: true
    };
  }
  next(); // Continue to JSON Server router
});

/**
 * add PUT /tokens/:id/pin route
 */
server.use((req, res, next) => {
  let match = /(\/tokens\/([^/]+))\/pin/.exec(req.url);
  if (req.method === 'PUT' && match) {
    const rewritePath = match[1];
    const id = match[2];
    const currentPin = req.param('pin', {}).currentValue;
    const newPin = req.param('pin', {}).newValue;

    let token = router.db.getState().tokens.find((e) => String(e.id) == String(id));

    if (token && (!token.pin && !currentPin || token.pin == currentPin)) {
      req.method = 'PATCH';
      req.url = rewritePath;
      req.body = {
        pin: (newPin ? newPin : undefined)
      };
      next();
    } else {
      res.send(401, 'Current pin value is incorrect');
    }
  } else {
    next(); // Continue to JSON Server router
  }
});


server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
