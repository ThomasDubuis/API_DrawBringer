module.exports = (sequelize, DataTypes)=>{
    const User = sequelize.define("User", {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue:0
        },
        bio: {
            type: DataTypes.STRING,
            allowNull: true
        },
    });

    User.associate = models => {
        User.hasMany(models.Dessin, {
            onDelete: 'Cascade',
            foreignKey: 'UserId'
        });
    };

    return User;
}