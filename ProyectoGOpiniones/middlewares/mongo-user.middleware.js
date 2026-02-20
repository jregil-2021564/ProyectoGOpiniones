'use strict';

import MongoUser from '../src/users/mongo-user.model.js';
import { User as SequelizeUser } from '../src/users/user.model.js';

export const getMongoUser = async (req, res, next) => {
    try {
        const sequelizeUserId = req.userId;
        
        if (!sequelizeUserId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Buscar usuario en MongoDB
        let mongoUser = await MongoUser.findOne({ sequelizeId: sequelizeUserId });
        
        // Si no existe, intentar sincronizar automáticamente
        if (!mongoUser) {
            console.log(`Usuario ${sequelizeUserId} no encontrado en MongoDB. Intentando sincronizar...`);
            
            // Buscar en Sequelize
            const sequelizeUser = await SequelizeUser.findByPk(sequelizeUserId);
            
            if (sequelizeUser) {
                // Crear en MongoDB
                mongoUser = new MongoUser({
                    sequelizeId: sequelizeUser.Id,
                    name: sequelizeUser.Name || '',
                    surname: sequelizeUser.Surname || '',
                    username: sequelizeUser.Username,
                    email: sequelizeUser.Email,
                    isActive: sequelizeUser.Status || false
                });
                
                await mongoUser.save();
                console.log(`Usuario ${sequelizeUser.Username} sincronizado automáticamente`);
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado en el sistema'
                });
            }
        }

        req.mongoUserId = mongoUser._id;
        req.mongoUser = mongoUser;
        
        next();
    } catch (error) {
        console.error('Error en middleware getMongoUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};
// Middleware para verificar propiedad de posts
export const checkPostOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mongoUserId = req.mongoUserId;

        const Post = (await import('../src/posts/post.model.js')).default;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        if (post.author.toString() !== mongoUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar esta publicación'
            });
        }

        req.post = post;
        next();
    } catch (error) {
        console.error('Error en middleware checkPostOwnership:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar propiedad',
            error: error.message
        });
    }
};

// Middleware para verificar propiedad de comentarios
export const checkCommentOwnership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mongoUserId = req.mongoUserId;

        const Comment = (await import('../src/comments/comment.model.js')).default;
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado'
            });
        }

        if (comment.author.toString() !== mongoUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para modificar este comentario'
            });
        }

        req.comment = comment;
        next();
    } catch (error) {
        console.error('Error en middleware checkCommentOwnership:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al verificar propiedad',
            error: error.message
        });
    }
};