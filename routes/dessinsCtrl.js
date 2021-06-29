const express = require("express");
const router = express.Router();
const db = require("../models");
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

//Create dessin
router.post('/createDessin',(req, res) =>{
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
    
    var title = req.body.title;
    var description = req.body.description;
    var reference = req.body.reference;
    
    asyncLib.waterfall([
        function(done){
            db.User.findOne({
                where: {id: userId}
            })
            .then( function(userFound){
                done(null,userFound)
            })
            .catch( function (err) {
                return res.json({'error':'unable to verify user'});
            });
        },
        function (userFound, done) {
            if(userFound){
                db.Dessin.create({
                    title:title,
                    description:description,
                    reference:reference,
                    UserId: userFound.id
                })
                .then(function (newDessin) {
                    done(newDessin);
                })
            }else{
                res.json({'error':'user not found'});
            }
        },
    ], function (newDessin) {
        if (newDessin) {
            return res.status(201).json(newDessin);
        }else {
            return res.json({'error':'cannot create dessin'});
        }
    });
});

//get all dessin
router.get('/getDessins',(req,res)=>{
    var fields = req.query.fields;
    var limit = parseInt(req.query.limit);
    var offset = parseInt(req.query.offset);
    var order = req.query.order;

    db.Dessin.findAll({
        order:[(order!=null)? order.split(':'): ['title','ASC']],
        attributes: (fields !=='*' && fields != null) ? fields.split(',') : null,
        limit:(!isNaN(limit))? limit :null,
        offset:(!isNaN(offset))? offset: null,
        include: [{
            model:db.User,
            attributes: ['id','first_name', 'last_name']
        }]
    }).then(function (dessins) {
        if (dessins) {
            res.status(200).json(dessins);
        } else {
            res.json({'error':'no dessins found'});
        }
    }).catch( function (err) {
        console.log(err);
        res.json({'error':'invalid fields'});
    });
});
module.exports = router;