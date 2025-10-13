import { NextFunction, Request, Response } from "express";
import Joi, { Schema } from "joi";
import { ValidationError } from "../utils/errors";

export const validator = (bodySchema: Schema | null, paramsSchema: Schema | null, querySchema: Schema | null) => (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate req body if body schema is only provided
        if (bodySchema) {
            const bodyResult = bodySchema.validate(req.body, { abortEarly: false }) 
            if (bodyResult.error) {
                const errorMessage = bodyResult.error.details.map((error) => error.message).join(', ')
                return next(new ValidationError(errorMessage))
            }
            req.body = bodyResult.value
        }

        next()

    } catch (error) {
        let message = 'Something went wrong!'
        if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message: string}))
        throw new Error(message)
    }
}

const registerSchema = Joi.object({
    email: Joi.string().trim().email().required().messages({
        "string.email": "Invalid email format!",
        "any.required": "Email is required!",
        "string.empty": "Email cannot be empty"
    }),
    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/)
        .required()
        .messages({
            "string.min": "Password must be at least 6 characters",
            "string.empty": "Password cannot be empty",
            "any.required": "Password is required",
            "string.pattern.base": "Password must contain letters, numbers, and special characters",
        }),
    confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Password does not match!'
    }),
    fullname:Joi.string().required(),
    username: Joi.string().trim().empty('').allow(null).optional(),
    status: Joi.string().trim().empty('').allow(null).optional(),
    occupation: Joi.string().trim().empty('').allow(null).optional(),
    // profile_picture: Joi.string().uri().allow('', null).optional(),
    phone: Joi.string()
        .trim()
        .pattern(/^(?:\+234|234|0)[789][01]\d{8}$/)
        .replace(/^(?:\+234|234)/, '0')
        .messages({
            'string.pattern.base': 'Please enter a valid phone number (e.g., 08012345678)',
        }).empty('').allow(null).optional(),
    date_of_birth: Joi.date().max('now').empty('').allow(null).optional()
})

const loginSchema = Joi.object({
    identifier: Joi.alternatives().try(
        Joi.string().trim().email().messages({
            "string.email": "Invalid email format!",
            "string.empty": "Email or phone cannot be empty"
        }),
        Joi.string()
            .trim()
            .pattern(/^(?:\+234|234|0)[789][01]\d{8}$/)
            .replace(/^(?:\+234|234)/, '0')
            .messages({
                'string.pattern.base': 'Please enter a valid phone number (e.g., 08012345678)',
                "string.empty": "Email or phone cannot be empty"
            })
    ).required().messages({
        "any.required": "Email or phone is required!",
        "alternatives.match": "Invalid email or phone number format!" // Generic message if neither matches
    }),
    password: Joi.string()
        .min(6)
        // .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.&lt;&gt;/?]).+$/)
        .required()
        .messages({
            "string.min": "Invalid password",
            // "string.empty": "Invalid password",
            // "any.required": "Invalid password",
            // "string.pattern.base": "Invalid password",
        }),
});

export const validateRegister = validator(registerSchema, null, null)
export const validateLogin = validator(loginSchema, null, null)

