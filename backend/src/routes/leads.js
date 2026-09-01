import express from "express";
import { LeadsController } from "../controllers/leadsController.js";

const router = express.Router();

// POST /api/leads - Criar novo lead
router.post("/", LeadsController.create);

// GET /api/leads - Listar todos os leads (com filtros)
router.get("/", LeadsController.getAll);

// GET /api/leads/:id - Buscar lead específico
router.get("/:id", LeadsController.getById);

// PUT /api/leads/:id - Atualizar lead
router.put("/:id", LeadsController.update);

// DELETE /api/leads/:id - Deletar lead
router.delete("/:id", LeadsController.delete);

export default router;
