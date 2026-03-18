import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";

export const Img = sequelize.define(
    "Img",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                return process.env.API_URL + this.getDataValue("path");
            },
        },
    },
    {
        tableName: "img",
        timestamps: false,
    },
);

Img.associate = (models) => {
    Img.hasOne(models.Video, {
        foreignKey: {
            name: "img_id",
            allowNull: true,
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    });
};
