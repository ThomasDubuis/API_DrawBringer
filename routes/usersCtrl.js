const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

//constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

// User register
router.post('/register',(req,res) => {
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;
    var bio = req.body.bio;
    if(first_name == null || last_name == null || email== null || password == null){
        return res.status(400).json({'error':'missing parameters'})
    }
    if(first_name.length >= 20 || first_name.length <=1){ return res.status(400).json({'error':'wrong firstname (must be length 2 - 20)'}) };
    if(last_name.length >= 20 || last_name.length <=1){ return res.status(400).json({'error':'wrong last_name (must be length 2 - 20)'}) };
    
    if (!EMAIL_REGEX.test(email)){ return res.status(400).json({'error':'email is not valid'}) };
    if(!PASSWORD_REGEX.test(password)){ return res.status(400).json({'error':'password invalid (must lenght 4 - 8 and include 1 number at least)'}) };
    //User already exist?
    db.User.findOne({
        attributes:['email'],
        where:{email:email}
    })
    .then(userFound =>{
        if(!userFound){
            
            bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                db.User.create({
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    password: bcryptedPassword,
                    bio: bio
                })
                .then( newUser => res.status(201).json({
                    'userId': newUser.id
                }))
                .catch( err => res.status(500).json({'error':'cannot add user'}));
            })
        }else {
            return res.status(409).json({'error':'user already exist'})
        }
    })
    .catch(function(err) {
        res.status(500).json({'error': 'unable to verify user'});
    })
});

// User login
router.post('/login',(req,res) => {
    var email = req.body.email;
    var password = req.body.password;
    if(email == null || password == null){
        return res.status(400).json({'error':'missing parameters'})
    }
    db.User.findOne({
        where:{email:email}
    })
    .then(userFound =>{
        if(userFound){
            bcrypt.compare(password,userFound.password, function(errBycrypt,resBycrypt) {
                if(resBycrypt) {
                    return res.status(200).json({
                        'userID': userFound.id,
                        'token': jwtUtils.generateTokenForUser(userFound)
                    })
                }else {
                    return res.status(403).json({'error':'invalid password'});
                }
            });
        }else{
            return res.status(400).json({'error':'user not exist in DB'});
        }
    })
    .catch(function(err) {
        res.status(500).json({'error': 'unable to verify user'});
    })
});

// GetMe
router.get('/me',(req,res) => {
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
    
    if (userId <0){ return res.status(400).json({'error':'wrong token'}); };
    
    db.User.findOne({
        attributes: ['id','email','first_name','last_name','bio'],
        where: {id:userId},
        include:[db.Dessin]
    }).then(user => {
        if (user) {
            res.status(201).json(user);
        } else {
            res.status(404).json({ 'error':'user not found'});
        }
    }).catch(err => res.status(500).json({'error': 'cannot fetch user'}));
});

//delete User
router.delete('/me',(req, res) =>{
     //Getting auth header
     var headerAuth = req.headers['authorization'];
     var userId = jwtUtils.getUserId(headerAuth);
     
     if (userId <0){ return res.status(400).json({'error':'wrong token'}); };
     
     db.User.findOne({
        attributes: ['id','email','first_name','last_name','bio'],
        where: {id:userId},
        include:[db.Dessin]
    }).then(user => {
        if (user) {
            db.User.destroy({
                where: {
                    id: userId
                }
            }).then(()=> res.send("success"));
        } else {
            res.status(404).json({ 'error':'user not found'});
        }
    }).catch(err => res.status(500).json({'error':'unable to verify user'}));

});

//Update User (first name, last name and bio)
router.put('/me',(req,res) => {
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
    
    if (userId <0){ return res.status(400).json({'error':'wrong token'}); };
    //Params
    var bio = req.body.bio;
    var first_name= req.body.first_name;
    var last_name= req.body.last_name;

    asyncLib.waterfall([
        function(done) {
            db.User.findOne({
                attributes:['id','bio','first_name','last_name','email','password'],
                where: {id: userId}
            }).then(function(userFound) {
                done(null, userFound);
            }).catch(function(err) {
                return res.status(500).json({'error': 'unable to verify user'});
            });
        },
        function(userFound, done) {
            if (userFound) {
                userFound.update({
                    bio:(bio ? bio : userFound.bio),
                    first_name:(first_name ? first_name : userFound.first_name),
                    last_name:(last_name ? last_name : userFound.last_name)
                }).then(function() {
                    done(userFound)
                }).catch( function(err) {
                    res.status(500).json({'error':'cannot update user'});
                });
            } else {
                res.status(404).json({'error':'user not found'});
            }
        },
    ],function(userFound) {
        if (userFound) {
            return res.status(201).json(
                {'id': userFound.id,
                 'last_name': userFound.last_name,
                 'first_name': userFound.first_name,
                 'bio': userFound.bio
                });
        }else {
            return res.status(500).json({'error':'cannot update user profile'});
        }
    })
    
});
module.exports = router;