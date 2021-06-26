module.exports = (sequelize, DataTypes)=>{
    const Like = sequelize.define("Like", {
        UserId: {
            type: DataTypes.INTEGER,
            references: {
                model:'User',
                key: 'id'
            }
        },
        dessinId: {
            type: DataTypes.INTEGER,
            references: {
                model:'Dessin',
                key: 'id'
            }
        },
    });
    
    
    Like.associate = (models) => {
        // associations can be defined here
        models.User.belongsToMany(models.Dessin, {
            through: models.Like,
            foreignKey: 'UserId',
            otherKey: 'dessinId',
        });

        models.Dessin.belongsToMany(models.User, {
            through: models.Like,
            foreignKey: 'dessinId',
            otherKey: 'UserId',
        });

        models.Like.belongsTo(models.User, {
            through: models.Like,
            foreignKey: 'UserId',
            as: 'user',
        });

        models.Like.belongsTo(models.Dessin, {
            through: models.Like,
            foreignKey: 'dessinId',
            as: 'dessin',
        });
    };
    return Like;
}