'use strict';

import Like from './like.model.js';
import Post from '../posts/post.model.js';
import mongoose from 'mongoose';

// Dar like a una publicación
export const likePost = async (req, res) => {
    try {
        const { postId } = req.body;
        const userId = req.mongoUserId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de publicación no válido'
            });
        }

        const post = await Post.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Publicación no encontrada'
            });
        }

        // Verificar si ya existe el like
        const existingLike = await Like.findOne({ user: userId, post: postId });

        if (existingLike) {
            return res.status(400).json({
                success: false,
                message: 'Ya has dado like a esta publicación'
            });
        }

        const like = new Like({
            user: userId,
            post: postId
        });

        await like.save();

        // Incrementar contador
        post.likesCount += 1;
        await post.save();

        res.status(201).json({
            success: true,
            message: 'Like agregado exitosamente',
            data: { likesCount: post.likesCount }
        });

    } catch (error) {
        console.error('Error liking post:', error);
        
        // Error por índice único
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya has dado like a esta publicación'
            });
        }

        res.status(400).json({
            success: false,
            message: 'Error al dar like',
            error: error.message
        });
    }
};

// Quitar like
export const unlikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.mongoUserId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de publicación no válido'
            });
        }

        const like = await Like.findOne({ user: userId, post: postId });

        if (!like) {
            return res.status(404).json({
                success: false,
                message: 'No has dado like a esta publicación'
            });
        }

        await like.deleteOne();

        // Decrementar contador
        const post = await Post.findById(postId);
        if (post) {
            post.likesCount = Math.max(0, post.likesCount - 1);
            await post.save();
        }

        res.status(200).json({
            success: true,
            message: 'Like removido exitosamente',
            data: { likesCount: post?.likesCount || 0 }
        });

    } catch (error) {
        console.error('Error unliking post:', error);
        res.status(400).json({
            success: false,
            message: 'Error al quitar like',
            error: error.message
        });
    }
};

// Verificar si el usuario dio like
export const checkLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.mongoUserId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de publicación no válido'
            });
        }

        const like = await Like.findOne({ user: userId, post: postId });

        res.status(200).json({
            success: true,
            data: {
                liked: !!like
            }
        });

    } catch (error) {
        console.error('Error checking like:', error);
        res.status(400).json({
            success: false,
            message: 'Error al verificar like',
            error: error.message
        });
    }
};

// Obtener usuarios que dieron like
export const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de publicación no válido'
            });
        }

        const likes = await Like.find({ post: postId })
            .populate('user', 'name username email')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Like.countDocuments({ post: postId });

        res.status(200).json({
            success: true,
            data: likes.map(like => like.user),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error getting likes:', error);
        res.status(400).json({
            success: false,
            message: 'Error al obtener los likes',
            error: error.message
        });
    }
};