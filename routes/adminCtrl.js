const express = require("express");
const router = express.Router();
const db = require("../models");
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

// GetMe
router.get('/getUsers',(req,res) => {
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var isAdmin = jwtUtils.getIsAdmin(headerAuth);

    var fields = req.query.fields;
    var limit = parseInt(req.query.limit);
    var offset = parseInt(req.query.offset);
    var order = req.query.order;

    if (isAdmin == false){ return res.status(400).json({'error':'wrong token or no admin'}); };
    
    db.User.findAll({
        order:[(order!=null)? order.split(':'): ['id','ASC']],
        attributes: (fields !=='*' && fields != null) ? fields.split(',') : null,
        limit:(!isNaN(limit))? limit :null,
        offset:(!isNaN(offset))? offset: null,
        include: [{
            model:db.Dessin,
            attributes: ['id','title', 'reference','description','likes']
        }]
    }).then(function (user) {
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({'error':'no user found'});
        }
    }).catch( function (err) {
        console.log(err);
        res.status(500).json({'error':'invalid fields'});
    });
});

//delete User
router.delete('/deleteUser',(req, res) =>{
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var isAdmin = jwtUtils.getIsAdmin(headerAuth);
    
    if (isAdmin == false){ return res.status(400).json({'error':'wrong token or no admin'}); };
    
    var userId = req.body.userId;
    if (userId < 0){ return res.status(400).json({'error':'Invalid params (userId)'}); };

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

//delete Dessin
router.delete('/deleteDessin',(req, res) =>{
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var isAdmin = jwtUtils.getIsAdmin(headerAuth);
    
    if (isAdmin == false){ return res.status(400).json({'error':'wrong token or no admin'}); };
    
    var dessinId = req.body.dessinId;
    if (dessinId < 0){ return res.status(400).json({'error':'Invalid params (dessinId)'}); };

    db.Dessin.findOne({
       attributes: ['id','UserId','title','description'],
       where: {id:dessinId}
   }).then(dessin => {
       if (dessin) {
           db.Dessin.destroy({
               where: {
                   id: dessinId
               }
           }).then(()=> res.send("success"));
       } else {
           res.status(404).json({ 'error':'dessin not found'});
       }
   }).catch(err => res.status(500).json({'error':'unable to verify dessin'}));
});


module.exports = router;