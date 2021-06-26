module.exports = (sequelize, DataTypes)=>{
    const Dessin = sequelize.define("Dessin", {
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        likes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
    });
    
    
    Dessin.associate = (models) => {
        // associations can be defined here
        Dessin.belongsTo(models.User, { 
            onDelete: 'Cascade',
            foreignKey: 'UserId'
        });
    };
    return Dessin;
}