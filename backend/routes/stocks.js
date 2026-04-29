const express = require('express')
const router = express.Router();
const db = require('../database/sql_connection')

router.post('/insert_stock', (req, res) => {
    const data = req.body;

    db.query("SELECT ID FROM Stock ORDER BY ID DESC LIMIT 1;", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }

        let last_id = result.length > 0 ? result[0].ID : 0;

        let values = data.map((item, index) => {
            return [
                last_id + index + 1,
                item.name,
                item.quantity,
                item.price
            ];
        });

        const query = "INSERT INTO Stock (ID, Name, Quantity, Price) VALUES ?";

        db.query(query, [values], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send(err["sqlMessage"]);
            }

            res.send("Inserted successfully");
        });
    });
});

router.get('/get_stocks', (req, res) => {
    db.query("SELECT * FROM Stock", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        // Map ID to id for frontend compatibility
        const mapped = result.map(row => ({
            id: row.ID,
            name: row.Name,
            quantity: row.Quantity,
            price: row.Price
        }));
        res.json(mapped);
    });
});

router.put('/update_stock', (req, res) => {
    const { id, quantityToAdd } = req.body;
    db.query("UPDATE Stock SET Quantity = Quantity + ? WHERE ID = ?", [quantityToAdd, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("DB error");
        }
        res.send("Stock updated successfully");
    });
});

module.exports = router;