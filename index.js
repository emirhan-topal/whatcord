const express = require('express');
const fs = require('fs');
const socketio = require('socket.io');
const http = require('http');

const app = express()
const server = http.createServer(app)
const io = socketio(server)

io.on('connection',socket => {
    console.log('connect!');
    socket.on('disconnect',() => {
        console.log('disconnect!');
    })
})

app.use(express.json())

app.get('/',(req,res) => {
    res.sendFile(__dirname+'/pages/mainPage.html')
})

app.get('/favicon.ico',(req,res) => {
    res.sendFile(__dirname+'/favicon.png')
})

app.get('/login',(req,res) => {
    res.sendFile(__dirname+'/pages/loginPage.html')
})

app.get('/register',(req,res) => {
    res.sendFile(__dirname+'/pages/registerPage.html')
})

app.get('/dashboard',(req,res) => {
    res.sendFile(__dirname+'/pages/dashboardPage.html')
})

app.post('/getuserstatus',(req,res) => {
    const username = req.body.username
    const password = req.body.password

    if((!username.includes('\\') || !username.includes('/') || !username.startsWith('..') || !username.startsWith('.')) && (username && password) && ((username.length >= 3 && 16 >= username.length) && (password.length >= 4 && 16 >= password.length))){
        fs.access(`./users/${username}.json`,fs.constants.F_OK,error => {
            if(error){
                res.json({"status":"error","content":"USER_NOT_FOUND"})
            }
            else{
                const userPassword = Buffer.from(JSON.parse(fs.readFileSync(`./users/${username}.json`,'utf-8')).password,'hex').toString('utf-8')

                if(userPassword == password){
                    res.json({"status":"ok","content":"VERIFICATION_SUCCESSFUL"})
                }
                else{
                    res.json({"status":"error","content":"VERIFICATION_FAILED"})
                }
            }
        })
    }
    else{
        res.json({"status":"error","content":"INVALID_PARAMS"})
    }
})

app.post('/createaccount',(req,res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    const accountDate = new Date()

    const writedData = {
        "password":Buffer.from(password,'utf-8').toString('hex'),
        "friends":[],
        "friendRequests":[],
        "accountCreateDate":accountDate.getDay() + '.' + (accountDate.getMonth() + 1) + '.' +accountDate.getFullYear(),
        "email":Buffer.from(email,'utf-8').toString('hex'),
        "isOnline":false
    }
    
    if((!username.includes('/') && !username.startsWith('..') && !username.startsWith('.')) && (username && password && email) && ((username.length >= 3 && 16 >= username.length) && (password.length >= 4 && 16 >= password.length))){
        fs.access(`./users/${username}.json`,fs.constants.F_OK,error => {
            if(error && error.code == 'ENOENT'){
                fs.readdir('./users',(error,files) => {
                    if(error){
                        res.json({"status":"error","content":"DATABASE_NOT_READ"})
                        return;
                    }

                    let isUsedEmail = false

                    for(let file of files){
                        const userEmail = Buffer.from(JSON.parse(fs.readFileSync(`./users/${file}`,'utf-8')).email,'hex').toString('utf-8')

                        if(userEmail.toLocaleUpperCase('TR') == email.toLocaleUpperCase('TR')){
                            res.json({"status":"error","content":"EMAIL_IS_AVABLE"})
                            isUsedEmail = true
                            break;
                        }
                    }

                    if(!isUsedEmail){
                        fs.writeFileSync(`./users/${username}.json`,JSON.stringify(writedData,null,4))

                        res.json({"status":"ok","content":"CREATED_ACCOUNT"})
                    }
                })
            }
            else{
                res.json({"status":"error","content":"USER_IS_AVABLE"})
            }
        })
    }
    else{
        res.json({"status":"error","content":"INVALID_PARAMS"})
    }
})

app.post('/getuserfriendsdata',(req,res) => {
    const username = req.body.username

    if((!username.includes('/') || !username.startsWith('..') || !username.startsWith('.')) && username && (username.length >= 3 && 16 >= username.length)){
        fs.access(`./users/${username}.json`,fs.constants.F_OK,error => {
            if(error){
                res.json({"status":"error","content":"USER_NOT_FOUND"})
            }
            else{
                res.json({"status":"ok","content":JSON.parse(fs.readFileSync(`./users/${username}.json`,'utf-8')).friends})
            }
        })
    }
    else{
        res.json({"status":"error","content":"INVALID_PARAMS"})
    }
})

app.post('/getuseronline',(req,res) => {
    const username = req.body.username

    if((!username.includes('/') || !username.startsWith('..') || !username.startsWith('.')) && username && (username.length >= 3 && 16 >= username.length)){
        fs.access(`./users/${username}.json`,fs.constants.F_OK,error => {
            if(error){
                res.json({"status":"error","content":"USER_NOT_FOUND"})
            }
            else{
                const isOnline = JSON.parse(fs.readFileSync(`./users/${username}.json`,'utf-8')).isOnline

                res.json({"isOnline":isOnline})
            }
        })
    }
    else{
        res.json({"status":"error","content":"INVALID_PARAMS"})
    }
})

server.listen(3000,() => console.log('Sunucu, 3000 port\'ta dinleniyor!'))