'use strict';

import mongoose from 'mongoose';

const commentSchema = mongoose.Schema({
    content: {
        type: String,
        required: [true, 'El contenido del comentario es requerido'],
        trim: true,
        maxLength: [1000, 'El comentario no puede exceder 1000 caracteres'],
        minLength: [1, 'El comentario debe tener al menos 1 carácter']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MongoUser',
        required: [true, 'El autor es requerido']
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'La publicación es requerida']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false,
    collection: 'comments'
});

// Índices para búsquedas eficientes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ createdAt: -1 });

export default mongoose.model('Comment', commentSchema);