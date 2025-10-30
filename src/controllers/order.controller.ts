import type { Request, Response } from "express"
import type { MenuItemType } from "../models/restaurant.model.js";
import expressAsyncHandler from "express-async-handler"
import Stripe from "stripe";
import Restaurant from "../models/restaurant.model.js";
import Order from "../models/order.model.js";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string)
const FRONTEND_URL = process.env.FRONTEND_URL as string
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string

type CheckoutSessionRequest = {
    cartItems : {
        menuItemId : string;
        name : string;
        quantity : string;
    }[];
    deliveryDetails : {
        email : string;
        name : string;
        city : string;
        addressLine1 : string;
        country : string
    }
    restaurantId : string
}

const getMyOrders = expressAsyncHandler(async (req: Request , res : Response):Promise<void> => {
    const orders = await Order.findById(req.userId).populate("restaurant").populate("user");
    res.status(200).json({
        success : true,
        message : "Orders get successfully!",
        data : orders
    })
})

const stripeWebHookHandler = expressAsyncHandler(async (req : Request , res : Response): Promise<void> => {
    let event;
    const signature = req.headers["stripe-signature"];
    event = STRIPE.webhooks.constructEvent(req.body, signature as string, STRIPE_ENDPOINT_SECRET )

    if(event.type === "checkout.session.completed"){
        const order = await Order.findById(event.data.object.metadata?.orderId);

        if(!order) {
             res.status(404).json({
                message : "Order not found!"
             })
            return;
        }
        order.totalAmount = event.data.object.amount_total;
        order.status = "paid";

        await order.save()
    }
    res.send()
})

const createCheckoutSession = expressAsyncHandler(async (req : Request, res : Response): Promise<void> => {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;


    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);


    if(!restaurant){
        throw new Error("Restaurant not found!");
    }

    const newOrder =  new Order({
        restaurant : restaurant,
        user : req.userId,
        status : "placed",
        deliveryDetails : checkoutSessionRequest.deliveryDetails,
        cartItems : checkoutSessionRequest.cartItems,
        createdAt : new Date()
    })

    const lineItems = createLineItems(checkoutSessionRequest , restaurant.menuItems);

    const session = await createSession(lineItems , newOrder._id.toString(), restaurant.deliveryPrice, restaurant._id.toString());

    if(!session.url){
        res.status(500).json({
            message : "Error creating stripe session"
        })
        return;
    }


    await newOrder.save();
    res.json({url : session.url})
})

const createLineItems = (checkoutSessionRequest : CheckoutSessionRequest, menuItems : MenuItemType[]) => {
    // 1.for each cartItem , get the menuItem object from the restaurant
    // 2. for each cartitem , convert it into stripe line item
    // 3. return line item array
    const lineItems = checkoutSessionRequest.cartItems.map(cartItem => {
        const menuItem = menuItems.find(item => item._id.toString() === cartItem.menuItemId.toString());

        if(!menuItem){
            throw new Error(`Menu item not found ${cartItem.menuItemId}`)
        }

        const line_item : Stripe.Checkout.SessionCreateParams.LineItem= {
                price_data : {
                    currency : "usd",
                    unit_amount : parseInt( menuItem.price),
                    product_data : {
                        name : menuItem.name
                    }
                },
                quantity : Number(cartItem.quantity)
        }

        return line_item
    })

    return lineItems
}

const createSession =async (
    lineItems : Stripe.Checkout.SessionCreateParams.LineItem[],
    orderId : string,
    deliveryPrice : number,
    restaurantId : string
) => {
    const sessionData = await STRIPE.checkout.sessions.create({
        line_items : lineItems,
        shipping_options : [
            {
                shipping_rate_data : {
                    display_name : "Delivery",
                    type : 'fixed_amount',
                    fixed_amount : {
                        amount : deliveryPrice,
                        currency : "usd"
                    }
                }
            }
        ],
        mode : "payment",
        metadata : {
            orderId,
            restaurantId
        },
        success_url : `${FRONTEND_URL}/order-status?success=true`,
        cancel_url : `${FRONTEND_URL}/details/${restaurantId}?cancelled=true`
    })

    return sessionData;
}


export default {
    getMyOrders,
    createCheckoutSession,
    stripeWebHookHandler
}