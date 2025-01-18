const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
 createUser: function({userInput}, req){
    // const email = args.userInput.email;
    const email = userInput.email;
    return User.findOne({email: email}).then(user=>{
        if(user){ //if user have in db
            const error = new Error('User is already exist!');
            throw error;
        }
        return bcrypt.hash(userInput.password, 12)
    }).then((hashPass) => {
        const user = new User({
            email: userInput.email,
            password: hashPass,
            name: userInput.name,
        });
        return user.save();
    }).then(user=> {
        console.log(user);
        return {...user._doc, id: user._id.toString()};
    });
    
 }
};
