import winston from 'winston';

const logger = winston.createLogger({
    level:'debug',
    transports:[
        new winston.transports.Console({format: winston.format.simple()}),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            })
    ]
})

export default logger;