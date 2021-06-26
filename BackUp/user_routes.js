const express = require("express");
const router = express.Router();
const db = require("../models");
const bcrypt = require('bcrypt');

//constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;
// get all User
router.get('/all',(req, res)=> {
    db.User.findAll({
        include:[db.Dessin]
    }).then(Users=> res.send(Users));
})

// get single User by id
router.get('/find/:id', (req, res)=> {
    db.User.findAll({
        include:[db.Dessin],
        where:{
            id:req.params.id
        }
    }).then( User => res.send(User));
});

// post new User
router.post('/new',(req,res) => {
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

// delete User
router.delete('/delete/:id',(req,res)=> {
    db.User.destroy({
        where: {
            id: req.params.id
        }
    }).then(()=> res.send("success"));
});

// update a User
router.put('/update',(req,res)=> {
    if(req.body.id == null){
        return res.status(400).json({'error':'idUser not defined'});
    }
    if(req.body.email == "" || req.body.first_name == "" || req.body.last_name == "" || req.body.password == "" || req.body.bio == ""){
        return res.status(400).json({'error':'Params empty'});
        
    }
    if (req.body.password !="" || req.body.password !="null") {
        bcrypt.hash(req.body.password, 5, function( err, bcryptedPassword ) {
            db.User.update({password: bcryptedPassword},{ where:{ id:req.body.id}});
        })
    }
    db.User.update({
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        bio:req.body.bio
    },{
        where:{
            id:req.body.id
        }
    }).then(()=> res.send("success"))
});

module.exports = router;