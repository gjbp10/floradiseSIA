import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const cityOptions = [
    "Manila",
    "Quezon City",
    "Makati",
    "Pasig",
    "Taguig",
    "Caloocan",
    "Parañaque",
    "Mandaluyong",
    "San Juan",
    "Las Piñas",
    "Pasay",
    "Valenzuela",
    "Marikina",
    "Navotas",
    "Malabon"
   
];

const PlaceOrder = () => {
    const [method, setMethod] = useState('cod');
    const { 
        navigate, 
        backendUrl, 
        token, 
        cartItems, 
        setCartItems, 
        getCartAmount, 
        delivery_fee, 
        products, 
        user 
    } = useContext(ShopContext);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        zipcode: user?.address?.zipcode || '',
        phone: user?.phone || ''
    });

    // Populate form data with user's existing info if available
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                zipcode: user.address?.zipcode || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setFormData(data => ({ ...data, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        
        if (getCartAmount() === 0) {
            toast.error("Your cart is empty. Please add items before placing an order.");
            return;
        }

        try {
            let orderItems = [];
            // Structure cart items for the backend
            for (const productId in cartItems) {
                for (const size in cartItems[productId]) {
                    if (cartItems[productId][size] > 0) {
                        const productInfo = products.find(product => product._id === productId);
                        if (productInfo) {
                            const itemInfo = structuredClone(productInfo);
                            itemInfo.size = size;
                            itemInfo.quantity = cartItems[productId][size];
                            orderItems.push(itemInfo);
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee,
                method: method // Pass the selected payment method ('cod' or 'stripe')
            };

            const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } });

            if (response.data.success) {
                // ----------------- Stripe Payment Handling -----------------
                if (method === 'stripe' && response.data.session_url) {
                    // Redirect user to Stripe for payment
                    window.location.replace(response.data.session_url);
                } 
                // ----------------- COD Payment Handling --------------------
                else {
                    // For COD, clear cart and navigate to orders
                    setCartItems({}); // Clears the cart on successful order
                    toast.success("Order placed successfully!");
                    navigate('/orders');
                }
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while placing the order.");
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                <div className='flex gap-3'>
                    <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                    <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                </div>
                <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                <div className='flex gap-3'>
                    <select
                        required
                        name="city"
                        value={formData.city}
                        onChange={onChangeHandler}
                        className='border border-gray-300 rounded py-1.5 px-3.5 w-full'
                    >
                        <option value="">Select City</option>
                        {cityOptions.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                    <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Zipcode' />
                </div>
                <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>
                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        {/* Stripe Selection */}
                        <div onClick={() => setMethod('stripe')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-lg transition-all duration-200 ${method === 'stripe' ? 'border-green-500 shadow-md' : 'border-gray-300'}`}>
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}></div>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="Stripe Logo" />
                        </div>
                        {/* COD Selection */}
                        <div onClick={() => setMethod('cod')} className={`flex items-center gap-3 border p-2 px-3 cursor-pointer rounded-lg transition-all duration-200 ${method === 'cod' ? 'border-green-500 shadow-md' : 'border-gray-300'}`}>
                            <div className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400 border-green-400' : 'border-gray-400'}`}></div>
                            <p className=' text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>
                    <div className='w-full text-end mt-8'>
                        <button 
                            type='submit' 
                            className='bg-black text-white px-16 py-3 text-sm font-medium rounded hover:bg-gray-800 transition-colors'
                        >
                            {method === 'stripe' ? 'PROCEED TO PAYMENT' : 'PLACE ORDER'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PlaceOrder;
