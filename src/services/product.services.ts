/**
 * @description Product service class to abstract all business logic
 * @description Used for cleaner and more efficient code
 */

import { ObjectId } from "mongoose"
import productsModel from "../models/products.model"
import cloudinaryUpload from "../utils/cloudinary"


class ProductService {

    /**
     * @description Creates a products
     * @param {string} name 
     * @param {string} price 
     * @param {string} category 
     * @param {string} image 
     * @param {string} description 
     * @access protected
     */
    async createProduct(
        name: string,
        price: number,
        category: string,
        image: any,
        description?: string,
    ): Promise<any> {
        if (!name && !price && !image && !category) {
            throw new Error('Please fill all required fields')
        }

        const data = new productsModel({
            name,
            price,
            category,
            image,
            description
        })

        if (image) {
            await cloudinaryUpload(image.path)
                .then((downloadURl: any) => {
                    data.image = downloadURl
                })
                .catch((err: any) => {
                    throw new Error(`CLOUDINARY ERROR => ${err.message}`)
                })
        }
        await data.save()
    }


    /**
     * @description Gets all products in the DB and selects the first 10 for query optimisation
     * @access public
     */
    async getProducts() {
        const products = await productsModel.find().limit(10).exec()
        return products
    }


    /**
     * @description Gets a product by its ID
     * @param {ObjectId} productId 
     * @access public
     */
    async getProduct(productId: ObjectId) {
        const product = await productsModel.findById({ _id: productId }).exec()
        return product
    }

    /**
     * @description Deletes a product by its ID
     * @param {ObjectId} productId 
     * @access protected
     */
    async deleteProduct(productId: ObjectId) {
        const product = await productsModel.findById({ _id: productId })
        if (!product) {
            throw new Error('Product cannot be found!')
        }
        await product.deleteOne()
        return
    }

    /**
     * @description Updates a product
     * @param {ObjectId} productId 
     * @param {Object} data 
     * @param {string} image 
     * @access protected
     */
    async updateProduct(
        productId: ObjectId,
        data: any,
        image: any
    ) {
        const product = await productsModel.findById({ _id: productId }).exec() as any
        if (!product) {
            throw new Error('Product cannot be found!')
        }

        if (image) {
            await cloudinaryUpload(image.path)
                .then((downloadURL: any) => {
                    product.image = downloadURL
                })
                .catch((err: any) => {
                    throw new Error(`CLOUDINARY ERROR => ${err.message}`)
                })
        }
        for (const field in data) {
            product[field] = data[field]
        }
        await productsModel.findByIdAndUpdate({ _id: productId }, product, { $new: true })
    }
}

export default ProductService
