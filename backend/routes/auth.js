const express = require('express');
const bcrypt = require('bcryptjs');
const { supabase } = require('../db');
const { signToken } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/auth/signup ──────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const validRoles = ['host', 'attendee'];
        const userRole = validRoles.includes(role) ? role : 'attendee';

        const hashedPassword = await bcrypt.hash(password, 12);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username: username || '', email, password: hashedPassword, role: userRole }])
            .select('id, email, username, role, created_at')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'An account with this email already exists.' });
            }
            throw error;
        }

        const token = signToken(data);
        return res.status(201).json({ message: 'Account created successfully!', token, user: data });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── POST /api/auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, username, password, role, created_at')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'No account found with this email.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        const { password: _, ...userInfo } = user;
        const token = signToken(userInfo);

        return res.status(200).json({ message: 'Login successful!', token, user: userInfo });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
