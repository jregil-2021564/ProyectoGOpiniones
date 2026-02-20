'use strict';

import mongoose from 'mongoose';

const mongoUserSchema = mongoose.Schema({
    sequelizeId: {
        type: String,
        required: [true, 'El ID de Sequelize es requerido'],
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    surname: {
        type: String,
        required: [true, 'El apellido es requerido'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es requerido'],
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        unique: true,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false,
    collection: 'users_mongo' // Colección separada para usuarios de MongoDB
});

// Índices para búsquedas eficientes
mongoUserSchema.index({ sequelizeId: 1 });
mongoUserSchema.index({ username: 1 });
mongoUserSchema.index({ email: 1 });

export default mongoose.model('MongoUser', mongoUserSchema);