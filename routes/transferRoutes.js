const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const dbPath = path.join(__dirname, "..", "database.json");

// Helpers
function clean(value) {
  if (value === undefined) return undefined;
  return String(value || "").trim().replace(/[<>]/g, "");
}

function readDb() {
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

// --------------------------------------------------
// POST /api/transfer  –  Lagre hentetillatelse
// --------------------------------------------------
router.post("/transfer", (req, res) => {
  const db = readDb();

  // Renser input
  const childIdRaw = clean(req.body.childId);
  const name = clean(req.body.name);
  const relation = clean(req.body.relation);
  const phone = clean(req.body.phone);
  const validDate = clean(req.body.validDate);
  const createdByParentId = clean(req.body.createdByParentId);
  const childId = parseInt(childIdRaw, 10);

  if (Number.isNaN(childId) || !name || !validDate) {
    return res.status(400).json({ error: "Mangler påkrevde felter" });
  }
  if (!isValidDate(validDate)) {
    return res.status(400).json({ error: "Ugyldig datoformat (bruk YYYY-MM-DD)" });
  }

  const child = db.children.find((c) => c.id === childId);
  if (!child) return res.status(404).json({ error: "Barn ikke funnet" });
  
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

// --------------------------------------------------
// GET /api/pickup-today – Hent dagens godkjente henting
// --------------------------------------------------
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
