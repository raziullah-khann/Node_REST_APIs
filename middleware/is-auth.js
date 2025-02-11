require("dotenv").config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY;
// console.log('Loaded SECRET_KEY:', SECRET_KEY); 

//currentl we not attached any token in request
module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not Authenticate user');
        error.statusCode = 401;
        throw error;
    }
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken
    try{
        decodedToken = jwt.verify(token, SECRET_KEY);
    }catch(err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){
        const error = new Error('Not Authenticate user');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    next();
}