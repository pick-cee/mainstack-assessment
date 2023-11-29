import express, { NextFunction } from 'express'
import cloudinaryUpload from '../utils/cloudinary';
import ProductService from '../services/product.services';
import CustomException from '../utils/error.handler';
import CustomResponse from '../utils/response.handler';

let prodService: ProductService

/**
 * @description This allows a user to create a product once logged in
 * @api {POST} /api/v1/product/create  
 * @access protected
 */
export async function CreateProduct(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    let data;
    if (request.fields) {
        data = JSON.parse(request.fields.data as unknown as string);
    }

    const { name, price, description, category } = data;

    const image = request.files?.file;
    console.log(request.user)
    try {
        await prodService.createProduct(name, price, category, image, description)
        return next(new CustomResponse(response).success(
            'Product created',
            { data, image },
            201,
            {
                type: 'success',
                action: 'product-create'
            }
        ))
    }
    catch (err: any) {
        return
        // return next(new CustomResponse(response).error(err.message, 500))
    }
}


/**
 * @description This allows a user to view all available products
 * @api {GET} /api/v1/product/get-products  
 * @access public
 */
export async function GetProducts(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    try {
        const products = await prodService.getProducts()
        return next(new CustomResponse(response).success(
            'Retrieved successfully....',
            { products },
            200,
            {
                type: "success",
                action: 'product-fetch'
            }
        ))
    }
    catch (err: any) {
        return next(new CustomResponse(response).error(err.message, 500))
    }
}


/**
 * @description This allows a user to view a product by ID
 * @api {GET} /api/v1/product/get-product?productId={productId}
 * @access public
 */
export async function GetProduct(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    const productId = request.query.productId
    try {
        const product = await prodService.getProduct(productId as any)
        return next(new CustomResponse(response).success(
            'Product retrieved....',
            product,
            200,
            {
                type: 'success',
                action: 'product-fetch'
            }
        ))
    }
    catch (err: any) {
        return next(new CustomResponse(response).error(err.message, 500))
    }
}


/**
 * @description This allows a user to update a product by ID
 * @api {PUT} /api/v1/product/update?productId={productId}
 * @access protected
 */
export async function UpdateProduct(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    try {
        const productId = request.query.productId
        let data;
        if (request.fields && request.fields.data) {
            data = JSON.parse(request.fields.data as unknown as string);
        }

        const image = request.files?.image;
        await prodService.updateProduct(productId as any, data, image)

        return next(new CustomResponse(response).success(
            'Updated successful',
            { data, image },
            200,
            {
                type: 'success',
                action: 'product-update'
            }
        ))
    }
    catch (err: any) {
        return next(new CustomResponse(response).error(err.message, 500))
    }
}


/**
 * @description This allows a user to delete a product by ID
 * @api {DELETE} /api/v1/product/delet?productId={productId}
 * @access protected
 */
export async function DeleteProduct(
    request: express.Request,
    response: express.Response,
    next: NextFunction
) {
    const productId = request.query.productId
    try {
        await prodService.deleteProduct(productId as any)
        return next(new CustomResponse(response).success(
            'Product deleted successfully',
            {},
            200,
            {
                type: 'success',
                action: 'product-delete'
            }
        ))
    }
    catch (err: any) {
        return next(new CustomResponse(response).error(err.message, 500))
    }
}