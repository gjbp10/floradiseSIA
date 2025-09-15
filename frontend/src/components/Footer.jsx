import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <img className='mb-5 w-32' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-gray-600'>Floradise is your green sanctuary, a community for everyone who shares a passion for plants. We believe in the simple joy of nurturing life and the peace that comes from a connection to nature. Our mission is to be your trusted partner on your plant-parenting journey, providing not just carefully selected plants, but also the guidance and quality tools you need to help your green family thrive. Join us in cultivating your own piece of paradise, one leaf at a time.</p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li>Home</li>
                <li>About us</li>
                <li>Delivery</li>
                <li>Privacy policy</li>
            </ul>
        </div>

       <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>+63 912 345 6789</li>
            <li>Support@Floradise.com</li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright 2025@ Floradise.com - All Right Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
