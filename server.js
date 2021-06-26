const express= require('express');
const app = express();
const db = require("./models");
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

//Routes API

const adminCtrl = require("./routes/adminCtrl");
app.use("/api/admin",adminCtrl);

const usersCtrl = require("./routes/usersCtrl");
app.use("/api/users",usersCtrl);

const dessinsCtrl = require("./routes/dessinsCtrl");
app.use("/api/dessins",dessinsCtrl);

const likesCtrl = require("./routes/likesCtrl");
app.use("/api/dessins",likesCtrl);



db.sequelize.sync().then(()=> {
    app.listen(PORT,()=>{
        console.log(`listening on: http://localhost:${PORT}`);
    });
});