
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser=require('cookie-parser')
const mongoSanitize=require('express-mongo-sanitize')
const helmet=require('helmet')
const {xss}=require('express-xss-sanitizer');
const rateLimit=require('express-rate-limit');
const hpp=require('hpp')
const cors=require('cors')

const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUI = require('swagger-ui-express')

dotenv.config({path:'./config/config.env'});

//connect DB here
connectDB();

const app=express();

const swaggerOptions = {
    swaggerDefinition:{
        openapi: '3.0.0',
        info:{
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple express VacQ API'
        },
        servers:[
            {
                url: 'http://localhost:5000/api/v1/'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs))

app.use(cookieParser());

app.use(express.json());

app.use(helmet());

app.use(xss());

const limiter=rateLimit({
    windowsMs: 10*60*1000,
    max:500
});

app.use(limiter);

app.use(hpp());

app.use(cors());

const Restaurant = require ('./routes/restaurants');
const auth = require('./routes/auth');
const appointments=require('./routes/appointments');

app.use(mongoSanitize());



app.use('/api/v1/restaurants' ,Restaurant);
app.use('/api/v1/auth',auth);
app.use('/api/v1/appointments',appointments);

const PORT=process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});
