    const express = require('express')
    const router = express.Router();
    const supabase = require('../database/supabase_conn')

    router.post('/insert_stock', async (req, res) => {
        const data = req.body;

        try {
            const { data: lastRecord, error: fetchErr } = await supabase
                .from('Stock')
                .select('id')
                .order('id', { ascending: false })
                .limit(1);

            if (fetchErr) {
                console.error(fetchErr);
                return res.status(500).send("DB error");
            }

            let last_id = (lastRecord && lastRecord.length > 0) ? lastRecord[0].id : 0;

            let values = data.map((item, index) => {
                return {
                    id: last_id + index + 1,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                };
            });

            const { error: insertErr } = await supabase
                .from('Stock')
                .insert(values);

            if (insertErr) {
                console.error(insertErr);
                return res.status(500).send(insertErr.message);
            }

            res.send("Inserted successfully");
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    router.get('/get_stocks', async (req, res) => {
        try {
            const { data, error } = await supabase.from('Stock').select('*');
            if (error) {
                console.error(error);
                return res.status(500).send("DB error");
            }
            
            // Map ID to id for frontend compatibility
            const mapped = data.map(row => ({
                id: row.id,
                name: row.name,
                quantity: row.quantity,
                price: row.price
            }));
            res.json(mapped);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    router.put('/update_stock', async (req, res) => {
        const { id, quantityToAdd } = req.body;
        try {
            const { data: stock, error: fetchErr } = await supabase
                .from('Stock')
                .select('quantity')
                .eq('id', id)
                .single();
                
            if (fetchErr) {
                console.error(fetchErr);
                return res.status(500).send("DB error");
            }
            
            const newQuantity = stock.quantity + quantityToAdd;
            
            const { error: updateErr } = await supabase
                .from('Stock')
                .update({ quantity: newQuantity })
                .eq('id', id);
                
            if (updateErr) {
                console.error(updateErr);
                return res.status(500).send("DB error");
            }
            res.send("Stock updated successfully");
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    module.exports = router;