import { sequelize } from "../services/DB.js";
import { DataTypes } from "@sequelize/core";
import imgService from "../services/img-service.js";

export const Video = sequelize.define(
    "Video",
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
        img_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        tableName: "video",
        timestamps: false,
        hooks: {
            async afterDestroy(post, options) {
                if (!post?.img_id) return;
                try {
                    await imgService.delete(post.img_id);
                } catch (error) {
                    console.log(error);
                }
            },
        },
    },
);

Video.associate = (models) => {
    Video.belongsTo(models.Img, {
        foreignKey: {
            name: "img_id",
            allowNull: true,
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
    });
};
