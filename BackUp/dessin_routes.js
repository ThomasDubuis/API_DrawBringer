const express = require("express");
const router = express.Router();
const db = require("../models");

// get all dessin
router.get('/all',(req, res)=> {
    db.Dessin.findAll({
        include:[db.User]
    }).then(Dessins=> res.send(Dessins));
})

// get single Dessin by id
router.get('/find/:id', (req, res)=> {
    db.Dessin.findAll({
        include:[db.User],
        where:{
            id:req.params.id
        }
    }).then( Dessin => res.send(Dessin));
});

// post new Dessin
router.post('/new',(req,res) => {
    var UserId = req.body.UserId;
    var title = req.body.title;
    var description = req.body.description;
    var reference = req.body.reference;
    if(title == null || reference == null || UserId == null){
        return res.status(400).json({'error':'missing parameters'})
    }
    //Dessin already exist?
    db.Dessin.findOne({
        attributes:['reference'],
        where:{reference:reference}
    })
    .then(DessinFound =>{
        if(!DessinFound){
                db.Dessin.create({
                    title: title,
                    description: description,
                    reference: reference,
                    UserId: UserId
                })
                .then( newDessin => res.status(201).json({
                    'DessinId': newDessin.id
                }))
                .catch( err => res.status(500).json({'error':'cannot add Dessin'}));
        }else {
            return res.status(409).json({'error':'Dessin already exist'})
        }
    })
    .catch(function(err) {
        res.status(500).json({'error': 'unable to verify Dessin'});
    })
});

// delete Dessin
router.delete('/delete/:id',(req,res)=> {
    db.Dessin.destroy({
        where: {
            id: req.params.id
        }
    }).then(()=> res.send("success"));
});

// update a Dessin
router.put('/update',(req,res)=> {
    if(req.body.id == null){
        return res.status(400).json({'error':'idDessin not defined'});
    }
    if(req.body.title == "" || req.body.description == "" || req.body.reference == "" || req.body.likes == ""){
        return res.status(400).json({'error':'Params empty'});

    }
    db.Dessin.update({
        title: req.body.title,
        description: req.body.description,
        reference: req.body.reference,
        likes: req.body.likes,
    },{
        where:{
            id:req.body.id
        }
    }).then(()=> res.send("success"))
})
module.exports = router;