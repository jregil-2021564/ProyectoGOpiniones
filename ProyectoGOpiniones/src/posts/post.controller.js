'use strict';

import Post from './post.model.js';
import Comment from '../comments/comment.model.js';
import Like from '../likes/like.model.js';
import mongoose from 'mongoose';

// Crear publicación
export const createPost = async (req, res) => {
    try {
        const { title, category, content } = req.body;
        const authorId = req.mongoUserId;

        const post = new Post({
            title,
            category,
            content,
            author: authorId
        });

        const savedPost = await post.save();
        
        // Populate author data
        await savedPost.populate('author', 'name username email');

        res.status(201).json({
            success: true,
            message: 'Publicación creada exitosamente',
            data: savedPost
        });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(400).json({
            success: false,
            message: 'Error al crear la publicación',
            error: error.message
        });
    }
};

// Obtener todas las publicaciones
export const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        
        let filter = { isActive: true };
        
        if (category) filter.category = category;
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Post.find(filter)
            .populate('author', 'name username email')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(400).json({
            success: false,
            message: 'Error al obtener las publicaciones',
            error: error.message
        });
    }
};

// Obtener publicación por ID
export const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de publicación no válido'
            });
        }

        const post = await Post.findById(id)
            .populate('author', 'name username email');

        if (!post || !post.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        // Obtener comentarios
        const comments = await Comment.find({ post: id, isActive: true })
            .populate('author', 'name username email')
            .sort({ createdAt: -1 });

        // Verificar si el usuario actual dio like (si está autenticado)
        let userLiked = false;
        if (req.mongoUserId) {
            const like = await Like.findOne({ 
                user: req.mongoUserId, 
                post: id 
            });
            userLiked = !!like;
        }

        res.status(200).json({
            success: true,
            data: {
                ...post.toObject(),
                comments,
                userLiked
            }
        });

    } catch (error) {
        console.error('Error getting post:', error);
        res.status(400).json({
            success: false,
            message: 'Error al obtener la publicación',
            error: error.message
        });
    }
};

// Obtener publicaciones por usuario
export const getPostsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Buscar usuario en MongoDB
        const MongoUser = (await import('../users/mongo-user.model.js')).default;
        const user = await MongoUser.findOne({ sequelizeId: userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const posts = await Post.find({ author: user._id, isActive: true })
            .populate('author', 'name username email')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Post.countDocuments({ author: user._id, isActive: true });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error getting user posts:', error);
        res.status(400).json({
            success: false,
            message: 'Error al obtener las publicaciones del usuario',
            error: error.message
        });
    }
};

// Actualizar publicación
export const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // No permitir actualizar campos sensibles
        delete updateData.author;
        delete updateData.likesCount;
        delete updateData.commentsCount;

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'name username email');

        res.status(200).json({
            success: true,
            message: 'Publicación actualizada exitosamente',
            data: updatedPost
        });

    } catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la publicación',
            error: error.message
        });
    }
};

// Eliminar publicación
export const deletePost = async (req, res) => {
    try {
        const post = req.post; // Viene del middleware checkPostOwnership

        // Soft delete
        post.isActive = false;
        await post.save();

        // Soft delete de comentarios relacionados
        await Comment.updateMany(
            { post: post._id },
            { isActive: false }
        );

        res.status(200).json({
            success: true,
            message: 'Publicación eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(400).json({
            success: false,
            message: 'Error al eliminar la publicación',
            error: error.message
        });
    }
};