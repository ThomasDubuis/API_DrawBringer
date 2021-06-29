const express = require("express");
const db = require("../models");
const router = express.Router();
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

// Like dessin
router.get('/:dessinId/vote/like',(req,res) => {
    
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId <0){ return res.json({'error':'wrong token'}); };
    
    //Params
    var dessinId = parseInt(req.params.dessinId);
    if (dessinId <=0) {
        return res.json({ 'error': 'invalid parameters'});
    }
    
    asyncLib.waterfall([
        function (done) {
            db.Dessin.findOne({
                where: {id: dessinId}
            })
            .then(function (dessinFound) {
                done(null,dessinFound);
            })
            .catch((err)=>{
                return res.json({'error': 'unable to verify dessin'});})
        },
        function (dessinFound, done) {
            if (dessinFound) {
                db.User.findOne({
                    where: {id:userId}
                })
                .then(userFound=>{done(null, dessinFound, userFound);})
                .catch(err=> {return res.json({'error':'unable to verify user'});});
            } else{
                res.json({'error': 'dessin not exist'});
            }
        },
        function (dessinFound, userFound, done) {
            if(userFound){
                db.Like.findOne({
                    where: {
                        UserId: userId,
                        dessinId: dessinId
                    }
                })
                .then((isUserAlreadyLiked)=>{
                    done(null,dessinFound, userFound, isUserAlreadyLiked);
                })
                .catch((err)=>{return res.json({'error': 'unable to verify is user already liked'});})
            }else{
                res.json({'error':'user not exist'})
            }
        },
        function (dessinFound, userFound, isUserAlreadyLiked, done) {
            if(!isUserAlreadyLiked) {
                dessinFound.addUser(userFound)
                .then(function (alreadyLikeFound) {
                    done(null,dessinFound, userFound)
                })
                .catch(function (err) {
                    return res.json({'error': 'unable to set user reaction'});
                });
            }else {
                return res.json({'error':'message already liked'});
            }
        },
        function (dessinFound,userFound, done) {
            dessinFound.update({likes: dessinFound.likes + 1})
            .then(function (dessinFound) {
                done(dessinFound)
            })
            .catch((err)=>{
                console.log(err);
                return res.json({'error': 'cannot update message like counter'});
            });
        },
    ],function (likedDessin) {
        if(likedDessin){
            return res.status(201).json(likedDessin);
        } else {
            return res.json({'error': 'cannot update message'});
        }
    });

});

// Dislike dessin
router.get('/:dessinId/vote/dislike',(req,res) => {
     
    //Getting auth header
    var headerAuth = req.headers['authorization'];
    var userId = jwtUtils.getUserId(headerAuth);
    if (userId <0){ return res.json({'error':'wrong token'}); };
    
    //Params
    var dessinId = parseInt(req.params.dessinId);
    if (dessinId <=0) {
        return res.json({ 'error': 'invalid parameters'});
    }
    
    asyncLib.waterfall([
        function (done) {
            db.Dessin.findOne({
                where: {id: dessinId}
            })
            .then(function (dessinFound) {
                done(null,dessinFound);
            })
            .catch((err)=>{return res.json({'error': 'unable to verify dessin'});})
        },
        function (dessinFound, done) {
            //verif if dessin existe
            if (dessinFound) {
                db.User.findOne({
                    where: {id:userId}
                })
                .then(userFound=>{done(null, dessinFound, userFound);})
                .catch(err=> {return res.json({'error':'unable to verify user'});});
            } else{
                res.json({'error': 'dessin not exist'});
            }
        },
        function (dessinFound, userFound, done) {
             //verif if user existe
            if(userFound){
                db.Like.findOne({
                    where: {
                        UserId: userId,
                        dessinId: dessinId
                    }
                })
                .then((isUserAlreadyLiked)=>{
                    done(null,dessinFound, userFound, isUserAlreadyLiked);
                })
                .catch((err)=>{return res.json({'error': 'unable to verify is user already liked'});})
            }else{
                res.json({'error':'user not exist'})
            }
        },
        function (dessinFound, userFound, isUserAlreadyLiked, done) {
            // verif if user liked dessin
            if(isUserAlreadyLiked) {
                isUserAlreadyLiked.destroy()
                .then(function () {
                    done(null,dessinFound, userFound)
                })
                .catch(function (err) {
                    return res.json({'error': 'cannot remove alreate liked post'});
                });
            }else {
                return res.json({'error':'message not liked'});
            }
        },
        function (dessinFound,userFound,done) {
            dessinFound.update({
                likes: dessinFound.likes - 1,
            }).then(()=>{
                done(dessinFound);
            }).catch((err)=>{
                return res.json({'error': 'cannot update message like counter'});
            })
        }
    ], function (likedDessin) {
        if(likedDessin){
            return res.status(201).json(likedDessin);
        } else {
            return res.json({'error': 'cannot update message'});
        }
    });

});

module.exports = router;