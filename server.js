const express = require('express')
const app = express()
const path = require('path')
const {logger} = require('./middleware/logger')
const { log } = require('console')
const errorHandler = require('./middleware/errorHandler')
const PORT = process.env.PORT || 3500

app.use(logger)

app.use(express.json())

app.use('/', express.static(path.join(__dirname, '/public')))
app.use('/', require('./routes/root'))

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

const server = app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});

// Graceful shutdown on SIGINT (Ctrl+C) signal
process.on('SIGINT', () => {
    console.log('Server shutting down gracefully...');
    
    // Perform any necessary cleanup tasks here, like closing database connections, releasing resources, etc.

    server.close(() => {
        console.log('Server has been gracefully terminated.');
        process.exit(0); // Exit the process gracefully
    });
});