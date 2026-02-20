'use strict';

import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true,
        maxLength: [200, 'El título no puede exceder 200 caracteres'],
        minLength: [3, 'El título debe tener al menos 3 caracteres']
    },
    category: {
        type: String,
        required: [true, 'La categoría es requerida'],
        trim: true,
        enum: {
            values: ['GENERAL', 'TECNOLOGIA', 'DEPORTES', 'ENTRETENIMIENTO', 'CIENCIA', 'POLITICA', 'SALUD', 'EDUCACION', 'OTRO'],
            message: 'Categoría no válida'
        },
        default: 'GENERAL'
    },
    content: {
        type: String,
        required: [true, 'El contenido es requerido'],
        trim: true,
        maxLength: [5000, 'El contenido no puede exceder 5000 caracteres'],
        minLength: [10, 'El contenido debe tener al menos 10 caracteres']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MongoUser',
        required: [true, 'El autor es requerido']
    },
    likesCount: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false,
    collection: 'posts'
});

// Índices para búsquedas eficientes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);