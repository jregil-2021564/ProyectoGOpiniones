'use strict';

import mongoose from 'mongoose';

const likeSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MongoUser',
        required: [true, 'El usuario es requerido']
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'La publicación es requerida']
    }
}, {
    timestamps: true,
    versionKey: false,
    collection: 'likes'
});

// Índice compuesto para asegurar un like por usuario por publicación
likeSchema.index({ user: 1, post: 1 }, { unique: true });
likeSchema.index({ post: 1 });
likeSchema.index({ user: 1 });

export default mongoose.model('Like', likeSchema);