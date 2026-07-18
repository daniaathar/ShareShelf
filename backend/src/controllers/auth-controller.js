import { prisma } from '../config/prisma.js';
import * as auth from '../services/auth-service.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';
import { userResponse } from '../utils/serializers.js';

export async function register(req, res) { const result = await auth.register(registerSchema.parse(req.body)); res.status(201).json({ data: { user: userResponse(result.user), accessToken: result.accessToken } }); }
export async function login(req, res) { const result = await auth.login(loginSchema.parse(req.body)); res.json({ data: { user: userResponse(result.user), accessToken: result.accessToken } }); }
export async function me(req, res) { const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth.sub } }); res.json({ data: { user: userResponse(user) } }); }
