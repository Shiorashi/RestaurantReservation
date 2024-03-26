
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

const PORT=process.env.PORT || 5000;
const app=express();
app.use(cookieParser());

app.use(express.json());

app.use(helmet());

app.use(xss());

const swaggerOptions = {
    swaggerDefinition:{
        openapi: '3.0.0',
        info:{
            title: 'Restaurant Reservation',
            version: '1.0.0',
            description: 'A simple express for restaurant reservation'
        },
        servers:[
            {
                url: process.env.HOST + ':' + PORT + '/api/v1'
            }
        ],
    },
    apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs))



const limiter=rateLimit({
    windowsMs: 10*60*1000,
    max:500
});

app.use(limiter);

app.use(hpp());

app.use(cors());

const Restaurant = require ('./routes/restaurants');
const auth = require('./routes/auth');
const reservations=require('./routes/reservations');

app.use(mongoSanitize());



app.use('/api/v1/restaurants' ,Restaurant);
app.use('/api/v1/auth',auth);
app.use('/api/v1/reservations',reservations);



const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'on ' + process.env.HOST + ':' + PORT));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
});
