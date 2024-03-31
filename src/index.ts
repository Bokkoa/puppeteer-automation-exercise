import winston from 'winston';
import App from './app';

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const app = new App(logger);

(async () => {
  await app.initConfig();
  await app.getTasks();
  await app.loadTasks();
  await app.end()
})();
