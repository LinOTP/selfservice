const jsonServer = require('json-server');
const server = jsonServer.create();

const path = require('path');
const router = jsonServer.router(path.join(__dirname, 'db.json'));

const middlewares = jsonServer.defaults();
server.use(middlewares);

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
  let match = /(\/tokens\/\d+)\/activate/.exec(req.url);
  if (req.method === 'POST' && match) {
    req.method = 'PATCH';
    req.url = match[1];
    req.body = {
      active: true
    };
  }
  next(); // Continue to JSON Server router
});


server.use(router);

server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
