require('dotenv').config();
const confidence = require('confidence');

const config = {
  port: process.env.PORT,
  appEnv: process.env.APP_ENV,
  cipher: {
    algorithm: process.env.CIPHER_ALGORITHM,
    ivLength: parseInt(process.env.CIPHER_IV_LENGTH),
    key: process.env.CIPHER_KEY
  },
  basicAuthApi: [
    {
      username: process.env.BASIC_AUTH_USERNAME,
      password: process.env.BASIC_AUTH_PASSWORD
    }
  ],
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  },
  jwt: {
    publicKey: process.env.PUBLIC_KEY,
    privateKey: process.env.PRIVATE_KEY,
    signOptions: {
      algorithm: process.env.JWT_SIGNING_ALGORITHM,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER,
      expiresIn: process.env.JWT_EXPIRATION_TIME
    },
    verifyOptions: {
      algorithm: process.env.JWT_ALGORITHM,
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER
    },
    refresh: {
      publicKey: process.env.REFRESH_PUBLIC_KEY,
      privateKey: process.env.REFRESH_PRIVATE_KEY,
      signOptions: {
        algorithm: process.env.JWT_SIGNING_ALGORITHM,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
        expiresIn: process.env.REFRESH_JWT_EXPIRATION_TIME
      },
    },
  },
  dsnSentryUrl: process.env.DSN_SENTRY_URL,
  mongoDbUrl: process.env.MONGO_DATABASE_URL,
  mysqlConfig: {
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  elasticsearch: {
    connectionClass: process.env.ELASTICSEARCH_CONNECTION_CLASS,
    apiVersion: process.env.ELASTICSEARCH_API_VERSION,
    host: [
      process.env.ELASTICSEARCH_HOST
    ],
    maxRetries: process.env.ELASTICSEARCH_MAX_RETRIES,
    requestTimeout: process.env.ELASTICSEARCH_REQUEST_TIMEOUT
  },
  kafka: {
    kafkaHost: process.env.KAFKA_HOST_URL,
  },
  redis: {
    connection: {
      host: process.env.REDIS_CLIENT_HOST,
      port: process.env.REDIS_CLIENT_PORT,
      passsword: process.env.REDIS_CLIENT_PASSWORD,
      auth_pass: process.env.REDIS_CLIENT_PASSWORD,
    },
    index: process.env.REDIS_CLIENT_INDEX
  },
  postgreConfig:{
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    port: process.env.POSTGRES_PORT,
    max:  process.env.POSTGRES_MAX,
    idleTimeoutMillis: process.env.POSTGRES_TIMEOUT

  },
  logstash: {
    host: process.env.LOGSTASH_HOST,
    port: process.env.LOGSTASH_PORT,
    node_name: process.env.LOGSTASH_NODE_NAME,
    ssl_enable: false,
    max_connect_retries: 10
  },
  mail: {
    sender: process.env.MAIL_SENDER,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
  },
  monitoring: parseInt(process.env.MONITORING) || 0,
  elasticApm: {
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    apiKey: process.env.ELASTIC_APM_API_KEY,
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  },
  ddTrace: {
    host: process.env.DD_AGENT_HOST,
    port: process.env.DD_AGENT_PORT,
    dogstatdPort: process.env.DD_DOGSTATSD_PORT,
  },
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);
