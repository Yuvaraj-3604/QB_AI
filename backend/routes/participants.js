const express = require('express');
const { supabase } = require('../db');

const router = express.Router();

// ── GET /api/participants ──────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json(data);

    } catch (error) {
        console.error('Get participants error:', error);
        return res.status(500).json({ error: 'Failed to fetch participants.' });
    }
});

// ── POST /api/participants ─────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { name, email, organization, phone, ticket_type } = req.body;

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and Email are required.' });
        }

        const { data, error } = await supabase
            .from('participants')
            .insert([{
                name,
                email,
                organization: organization || '',
                phone: phone || '',
                ticket_type: ticket_type || 'general',
                status: 'pending'
            }])
            .select('id')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'This email is already registered.' });
            }
            throw error;
        }

        return res.status(201).json({
            message: 'Participant registered successfully',
            id: data.id
        });

    } catch (error) {
        console.error('Create participant error:', error);
        return res.status(500).json({ error: 'Failed to register participant.' });
    }
});

// ── PUT /api/participants/:id ──────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ticket_type } = req.body;

        const updates = {};
        if (status !== undefined) updates.status = status;
        if (ticket_type !== undefined) updates.ticket_type = ticket_type;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No fields to update.' });
        }

        const { data, error } = await supabase
            .from('participants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Participant not found.' });

        return res.status(200).json({ message: 'Participant updated successfully.', participant: data });

    } catch (error) {
        console.error('Update participant error:', error);
        return res.status(500).json({ error: 'Failed to update participant.' });
    }
});

// ── DELETE /api/participants/:id ───────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('participants')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.status(200).json({ message: 'Participant deleted successfully.' });

    } catch (error) {
        console.error('Delete participant error:', error);
        return res.status(500).json({ error: 'Failed to delete participant.' });
    }
});

module.exports = router;
