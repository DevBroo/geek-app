import { ComponentLoader } from 'adminjs';


const componentLoader = new ComponentLoader()

const Components = {
    OrderProductList: componentLoader.add('OrderProductList','./components/OrderProductLists.jsx'),
    Dashboard: componentLoader.add('Dashboard', './components/Dashboard.jsx'),

    // other custom components
}

export { componentLoader, Components }