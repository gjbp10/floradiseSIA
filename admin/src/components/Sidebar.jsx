import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
      <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>

        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/add"
        >
          <img className='w-5 h-5' src={assets.add_icon} alt="" />
          <p className='hidden md:block'>Add Items</p>
        </NavLink>

        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/list"
        >
          <img className='w-5 h-5' src={assets.list_icon} alt="" />
          <p className='hidden md:block'>Product Items</p>
        </NavLink>

        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/orders"
        >
          <img className='w-5 h-5' src={assets.order_icon} alt="" />
          <p className='hidden md:block'>Orders</p>
        </NavLink>

    
        <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/inventory"
        >
          <img className='w-5 h-5' src={assets.inventory_icon} alt="" /> 
          <p className='hidden md:block'>Inventory Data</p>
        </NavLink>

       <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/user"
        >
          <img className='w-5 h-5' src={assets.user_icon || assets.order_icon} alt="" /> 
          <p className='hidden md:block'>Admin Users</p>
        </NavLink>

      <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/customer-data"
        >
          <img className='w-5 h-5' src={assets.user_icon || assets.order_icon} alt="" /> 
          <p className='hidden md:block'>Customers Account</p>
        </NavLink>

 <NavLink 
          className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l' 
          to="/sales-analytics"
        >
          <img className='w-5 h-5' src={assets.icon_pera || assets.icon_sales} alt="" /> 
          <p className='hidden md:block'>Sales Analytics Report</p>
        </NavLink>

      </div>
    </div>
  )
}

export default Sidebar
