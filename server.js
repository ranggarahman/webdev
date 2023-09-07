require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const {logger, logEvents} = require('./middleware/logger')
const { log } = require('console')
const errorHandler = require('./middleware/errorHandler')
const cors = require('cors')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3500
const corsOptions = require('./config/corsOptions')
const cookieParser = require('cookie-parser')

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, '/public')))
app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))

app.all('*', (req, res) => {
    res.status(404)

    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, '/views', '404.html'))
    } else if (req.accepts('json')){
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)


mongoose.connection.once('open', () => {
    console.log('connected to MongoDB')
    app.listen(PORT, () => {
        console.log(`Server Running on Port ${PORT}`);
    })
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log')
})


// // Graceful shutdown on SIGINT (Ctrl+C) signal
// process.on('SIGINT', () => {
//     console.log('Server shutting down gracefully...');
    
//     // Perform any necessary cleanup tasks here, like closing database connections, releasing resources, etc.

//     server.close(() => {
//         console.log('Server has been gracefully terminated.');
//         process.exit(0); // Exit the process gracefully
//     });
// });