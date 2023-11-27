import express, { Router } from "express";
const router: Router = express.Router();
import formidable from 'express-formidable'
import { CreateProduct, DeleteProduct, GetProduct, GetProducts, UpdateProduct } from "../controllers/product.controller";
import { verifyToken } from "../middlewares/verifyToken";

router.post('/create', verifyToken, formidable(), CreateProduct)
router.get('/get-products', GetProducts)
router.get('/get-product', GetProduct)
router.put('/update', verifyToken, formidable(), UpdateProduct)
router.delete('/delete', verifyToken, DeleteProduct)

export default router