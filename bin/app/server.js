const config = require('../infra/configs/global_config');
const { apm } = require('../helpers/components/monitoring/observability');
if (config.get('/monitoring') !== 0) {
  apm.init();
}
const { GracefulShutdown, livenessProbe, readinessProbe } = require('../helpers/components/joshu/graceful_shutdown');
const restify = require('restify');
const corsMiddleware = require('restify-cors-middleware');
const project = require('../../package.json');
const basicAuth = require('../auth/basic_auth_helper');
const jwtAuth = require('../auth/jwt_auth_helper');
const jwtAuthV2 = require('../auth/jwt_auth_helper_v2');
const wrapper = require('../helpers/utils/wrapper');
const userHandler = require('../modules/user/handlers/api_handler');
const userHandlerV2 = require('../modules/user-v2/handlers/api_handler');
const mongoConnectionPooling = require('../helpers/databases/mongodb/connection');
const observers = require('../modules/observers');
const swaggerUi = require('swagger-ui-restify');
const yaml = require('yamljs');
const swaggerDocument = yaml.load('./docs/swagger/codebase-backend.yaml');
const prometheus = require('../helpers/components/prometheus/prometheus');

class AppServer {

  constructor() {

    this.server = restify.createServer({
      name: `${project.name}-server`,
      version: project.version
    });

    this.init();

    this.server.serverKey = '';
    this.server.use(restify.plugins.acceptParser(this.server.acceptable));
    this.server.use(restify.plugins.queryParser());
    this.server.use(restify.plugins.bodyParser());
    this.server.use(restify.plugins.authorizationParser());

    // required for prometheus to observe all endpoints
    if (config.get('/monitoring') === 1) {
      this.server.use(prometheus.responseCounters);
    }

    // required for CORS configuration
    const corsConfig = corsMiddleware({
      preflightMaxAge: 5,
      origins: ['*'],
      // ['*'] -> to expose all header, any type header will be allow to access
      // X-Requested-With,content-type,GET, POST, PUT, PATCH, DELETE, OPTIONS -> header type
      allowHeaders: ['Authorization'],
      exposeHeaders: ['Authorization']
    });
    this.server.pre(corsConfig.preflight);
    this.server.use(corsConfig.actual);

    // // required for basic auth
    this.server.use(basicAuth.init());

    // anonymous can access the end point, place code bellow
    this.server.get('/', (req, res) => {
      wrapper.response(res, 'success', wrapper.data('Index'), 'This service is running properly');
    });

    // authenticated client can access the end point, place code bellow
    this.server.post('/users/v1/login', basicAuth.isAuthenticated, userHandler.postDataLogin);
    this.server.get('/users/v1/profile', jwtAuth.verifyToken, userHandler.getUser);
    this.server.post('/users/v1/register', basicAuth.isAuthenticated, userHandler.registerUser);
    this.server.post('/users/v1/refresh-token', basicAuth.isAuthenticated, userHandler.getRefreshToken);

    // authentication v2 using jwt revocation strategy
    this.server.post('/users/v2/login', basicAuth.isAuthenticated, userHandlerV2.loginUser);
    this.server.get('/users/v2/profile', jwtAuthV2.verifyToken, userHandlerV2.getUser);
    this.server.post('/users/v2/register', basicAuth.isAuthenticated, userHandlerV2.registerUser);
    this.server.post('/users/v2/refresh-token', basicAuth.isAuthenticated, userHandlerV2.getRefreshToken);
    this.server.post('/users/v2/logout', basicAuth.isAuthenticated, userHandlerV2.logoutUser);
    this.server.post('/users/v2/verify', basicAuth.isAuthenticated, userHandlerV2.verifyOtp);

    // api documentation
    if (config.get('/appEnv') !== 'prod') {
      this.server.get('/users/docs', swaggerUi.setup(swaggerDocument));
      this.server.get('/*', ...swaggerUi.serve);
    }

    // expose route for prometheus to pull metrics
    if (config.get('/monitoring') === 1) {
      prometheus.injectMetricsRoute(this.server);
      prometheus.startCollection();
    }
  }

  async init() {
    // Initiation
    try {
      await Promise.all([observers.init(), mongoConnectionPooling.init()]);

      const gs = new GracefulShutdown(config.get('/shutdownDelay'));
      gs.enable(this.server);
      this.server.get('/healthz', livenessProbe(gs));
      this.server.get('/readyz', readinessProbe(gs));
    } catch (err) {
      this.server.close();
      throw err;
    }
  }
}

module.exports = AppServer;
