const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbPath = path.join(__dirname, "..", "database.json");

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

router.post("/transfer", (req, res) => {
  const { childId, name, relation, phone, validDate, createdByParentId } =
    req.body;

  if (!childId || !name || !validDate) {
    return res.status(400).json({ error: "Mangler påkrevde felter" });
  }

  const db = readDb();
  const child = db.children.find((c) => c.id === childId);

  if (!child) {
    return res.status(404).json({ error: "Barn ikke funnet" });
  }

  const newAuth = {
    id: Date.now(),
    name,
    relation,
    phone,
    validDate,
    createdByParentId,
  };

  if (!child.pickupAuthorizations) {
    child.pickupAuthorizations = [];
  }

  child.pickupAuthorizations.push(newAuth);
  writeDb(db);

  res.status(201).json(newAuth);
});

router.get("/pickup-today", (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const db = readDb();

  const result = db.children.map((child) => {
    const validAuths = (child.pickupAuthorizations || []).filter(
      (auth) => auth.validDate === targetDate
    );

    return {
      childId: child.id,
      childName: child.name,
      pickupAuthorizations: validAuths,
    };
  });
  res.json(result);
});

module.exports = router;
