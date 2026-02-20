'use strict';

import Comment from './comment.model.js';
import Post from '../posts/post.model.js';
import mongoose from 'mongoose';

// Crear comentario
export const createComment = async (req, res) => {
    try {
        const { postId, content } = req.body;
        const authorId = req.mongoUserId;

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

        const comment = new Comment({
            content,
            author: authorId,
            post: postId
        });

        const savedComment = await comment.save();
        
        // Incrementar contador de comentarios
        post.commentsCount += 1;
        await post.save();

        await savedComment.populate('author', 'name username email');

        res.status(201).json({
            success: true,
            message: 'Comentario creado exitosamente',
            data: savedComment
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(400).json({
            success: false,
            message: 'Error al crear el comentario',
            error: error.message
        });
    }
};

// Obtener comentarios de una publicación
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de publicación no válido'
            });
        }

        const comments = await Comment.find({ post: postId, isActive: true })
            .populate('author', 'name username email')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Comment.countDocuments({ post: postId, isActive: true });

        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(400).json({
            success: false,
            message: 'Error al obtener los comentarios',
            error: error.message
        });
    }
};

// Actualizar comentario
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { content },
            { new: true, runValidators: true }
        ).populate('author', 'name username email');

        res.status(200).json({
            success: true,
            message: 'Comentario actualizado exitosamente',
            data: updatedComment
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el comentario',
            error: error.message
        });
    }
};

// Eliminar comentario
export const deleteComment = async (req, res) => {
    try {
        const comment = req.comment; // Viene del middleware checkCommentOwnership

        // Soft delete
        comment.isActive = false;
        await comment.save();

        // Decrementar contador de comentarios en el post
        await Post.findByIdAndUpdate(
            comment.post,
            { $inc: { commentsCount: -1 } }
        );

        res.status(200).json({
            success: true,
            message: 'Comentario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el comentario',
            error: error.message
        });
    }
};