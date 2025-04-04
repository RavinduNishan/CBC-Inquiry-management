import React from 'react'

const TableBlade = () => {
  return (
    <div>('_layouts.master')

   
        <h3 className="text-gray-700 text-3xl font-medium">Tables</h3>
    
        <div className="mt-4">
            <h4 className="text-gray-600">Simple Table</h4>
            
            <div className="mt-6">
                <div className="bg-white shadow rounded-md overflow-hidden my-6">
                    <table className="text-left w-full border-collapse">
                        <thead className="border-b">
                            <tr>
                                <th className="py-3 px-5 bg-indigo-800 font-medium uppercase text-sm text-gray-100">City</th>
                                <th className="py-3 px-5 bg-indigo-800 font-medium uppercase text-sm text-gray-100">Total orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-gray-200">
                                <td className="py-4 px-6 border-b text-gray-700 text-lg">New York</td>
                                <td className="py-4 px-6 border-b text-gray-500">200,120</td>
                            </tr>
                            <tr className="hover:bg-gray-200">
                                <td className="py-4 px-6 border-b text-gray-700 text-lg">Manchester</td>
                                <td className="py-4 px-6 border-b text-gray-500">632,310</td>
                            </tr>
                            <tr className="hover:bg-gray-200">
                                <td className="py-4 px-6 border-b text-gray-700 text-lg">London</td>
                                <td className="py-4 px-6 border-b text-gray-500">451,110</td>
                            </tr>
                            <tr className="hover:bg-gray-200">
                                <td className="py-4 px-6 border-b text-gray-700 text-lg">Madrid</td>
                                <td className="py-4 px-6 border-b text-gray-500">132,524</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    
        <div className="mt-8">
            <h4 className="text-gray-600">Table with pagination</h4>
            
            <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-700 leading-tight">Users</h2>
    
                <div className="mt-3 flex flex-col sm:flex-row">
                    <div className="flex">
                        <div className="relative">
                            <select className="appearance-none h-full rounded-l border block appearance-none w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                            </select>
    
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
    
                        <div className="relative">
                            <select className="appearance-none h-full rounded-r border-t sm:rounded-r-none sm:border-r-0 border-r border-b block appearance-none w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:border-l focus:border-r focus:bg-white focus:border-gray-500">
                                <option>All</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
    
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
    
                    <div className="block relative mt-2 sm:mt-0">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-gray-500">
                                <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z"></path>
                            </svg>
                        </span>
    
                        <input placeholder="Search" className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none" />
                    </div>
                </div>
    
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rol</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created at</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <img className="w-full h-full rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">Vera Carpenter</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Admin</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Jan 21, 2020</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                            <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                            <span className="relative">Activo</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <img className="w-full h-full rounded-full" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80" alt="" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap"> Blake Bowman</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Editor</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Jan 01, 2020</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                            <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                                            <span className="relative">Activo</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <img className="w-full h-full rounded-full" src="https://images.unsplash.com/photo-1540845511934-7721dd7adec3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80" alt="" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">Dana Moore</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Editor</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Jan 10, 2020</p>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className="relative inline-block px-3 py-1 font-semibold text-orange-900 leading-tight">
                                            <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full"></span>
                                            <span className="relative">Suspended</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-5 py-5 bg-white text-sm">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 w-10 h-10">
                                                <img className="w-full h-full rounded-full" src="https://images.unsplash.com/photo-1522609925277-66fea332c575?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.2&h=160&w=160&q=80" alt="" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-gray-900 whitespace-no-wrap">Alonzo Cox</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Admin</p>
                                    </td>
                                    <td className="px-5 py-5 bg-white text-sm">
                                        <p className="text-gray-900 whitespace-no-wrap">Jan 18, 2020</p>
                                    </td>
                                    <td className="px-5 py-5 bg-white text-sm">
                                        <span className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                                            <span aria-hidden className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                                            <span className="relative">Inactive</span>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="px-5 py-5 bg-white border-t flex flex-col xs:flex-row items-center xs:justify-between">
                            <span className="text-xs xs:text-sm text-gray-900">Showing 1 to 4 of 50 Entries</span>
    
                            <div className="inline-flex mt-2 xs:mt-0">
                                <button className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-l">Prev</button>
                                <button className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-r">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div className="mt-8">
            <h4 className="text-gray-600">Wide Table</h4>
            
            <div className="flex flex-col mt-6">
                <div className="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                    <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-100"></th>
                                </tr>
                            </thead>
    
                            <tbody className="bg-white">
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                                            </div>
    
                                            <div className="ml-4">
                                                <div className="text-sm leading-5 font-medium text-gray-900">John Doe</div>
                                                <div className="text-sm leading-5 text-gray-500">john@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">Software Engineer</div>
                                        <div className="text-sm leading-5 text-gray-500">Web dev</div>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    </td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">Owner</td>
    
                                    <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    @endsection
    </div>
  )
}

export default TableBlade