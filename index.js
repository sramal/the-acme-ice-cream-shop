const express = require("express");
const app = express();
app.use(require("morgan")("dev"));
app.use(express.json());

const pg = require("pg");
const client = new pg.Client(
    process.env.DATABASE_URL || "postgres://localhost/the_acme_ice_cream_shop"
);

const PORT = process.env.PORT || 3000;

// routes
// CREATE
app.post("/api/flavors", async (req, res, next) => {
    try {
        let is_favorite = false;

        if (req.body.hasOwnProperty("is_favorite")) {
            is_favorite = req.body.is_favorite;
        }

        const SQL =
            "INSERT INTO flavors(name, is_favorite) VALUES($1, $2) RETURNING *;";
        const response = await client.query(SQL, [req.body.name, is_favorite]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// READ
app.get("/api/flavors", async (req, res, next) => {
    try {
        const SQL = "SELECT * FROM flavors;";
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// READ
app.get("/api/flavors/:id", async (req, res, next) => {
    try {
        const SQL = "SELECT * FROM flavors WHERE id = $1;";
        const response = await client.query(SQL, [Number(req.params.id)]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// UPDATE
app.put("/api/flavors/:id", async (req, res, next) => {
    try {
        let is_favorite = false;

        if (req.body.hasOwnProperty("is_favorite")) {
            is_favorite = req.body.is_favorite;
        }

        let response;
        if (req.body.hasOwnProperty("name")) {
            const SQL =
                "UPDATE flavors SET name = $1, is_favorite = $2, updated_at = now() WHERE id = $3 RETURNING *;";
            response = await client.query(SQL, [
                req.body.name,
                is_favorite,
                req.params.id,
            ]);
        } else {
            const SQL =
                "UPDATE flavors SET is_favorite = $1, updated_at = now() WHERE id = $2 RETURNING *;";
            response = await client.query(SQL, [is_favorite, req.params.id]);
        }

        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// DELETE
app.delete("/api/flavors/:id", async (req, res, next) => {
    try {
        const SQL = "DELETE FROM flavors WHERE id = $1;";
        const response = await client.query(SQL, [Number(req.params.id)]);
        res.sendStatus(204);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

const init = async () => {
    await client.connect();

    let SQL = "DROP TABLE IF EXISTS flavors;";
    SQL += "CREATE TABLE flavors(id SERIAL PRIMARY KEY,";
    SQL += "                     name VARCHAR(100) NOT NULL,";
    SQL += "                     is_favorite BOOLEAN DEFAULT FALSE,";
    SQL += "                     created_at TIMESTAMP DEFAULT now(),";
    SQL += "                     updated_at TIMESTAMP DEFAULT now());";

    SQL += "INSERT INTO flavors(name) VALUES('Chocolate');";
    SQL += "INSERT INTO flavors(name) VALUES('Cookies and Cream');";
    SQL += "INSERT INTO flavors(name) VALUES('Butter pecan');";

    await client.query(SQL);

    app.listen(PORT, () => {
        console.log(`Server started and listening on port ${PORT}`);
    });
};

init();
