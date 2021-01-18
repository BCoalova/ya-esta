import React, {createContext, useState, useEffect, useReducer} from 'react'
import {getFirestore} from '../firebase'

export const StoreContext = createContext()
const { Provider } = StoreContext

export const counterInitialState = 0

const counterReducer = (state, action) => {
    switch (action) {
        case 'COUNTER_INCREMENT':
            return state + 1
        case 'COUNTER_DECREMENT':
            return state - 1
        case 'COUNTER_RESET' :
            return counterInitialState
        default:
            return state
    }
}

const StoreProvider = ({children}) => {

    //DATA
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)    
                
    useEffect(() => {
        const db = getFirestore()
        const itemsCollection = db.collection('items')
        const query = itemsCollection.get()
        query.then((result)=>{
            result.docs.forEach((doc)=>{
                const dataRes = doc.data()
                setData(data => [...data, dataRes])
                setLoading(false)
            })
        })
        .catch((err)=>{
            console.log(err)
        })
    }, []) 

    const [counterCount, dispatchCount] = useReducer(counterReducer, counterInitialState)
    
    let [stock, setStock] = useState()
    let [added, setAdded] = useState(false)
    let [cart, setCart] = useState([])
    let [cartWidgetACC, setCartWidgetACC] = useState(0)

    //Verificaciones de cambios en el carrito y en data
    /* useEffect(() => {
        console.log(`cambió cart =>`, cart)
    }, [cart])*/
    /* useEffect(() => {
        console.log(`cambió data =>`, data)
    }, [data])  */
    
    //Producto añadido al carrito
    const handleAdd = (item) => {
        setAdded(!added);
        setCartWidgetACC(cartWidgetACC + counterCount);
        const isInCart = cart.find(p => p.id === item.id);
        if (!isInCart) {
            const newProduct = { 
                id: item.id, 
                item: item, 
                quantity: counterCount, 
                totalPrice: counterCount * item.price,
                stockInStore: item.stock
            }
            setCart(cart => [...cart, newProduct]);
            handleRemoveFromStock(item)
        } else {
            isInCart.quantity += counterCount;
            isInCart.totalPrice = (counterCount * item.price) + isInCart.totalPrice
            setCart([...cart]);
            handleRemoveFromStock(item)
        }
    }
    //Remueve del stock en data la cantidad que se 
    //agrego al carrito
    const handleRemoveFromStock = (item) => {
        const newData = data
        const itemToChange = newData.find((p) => p.id === item.id);
        itemToChange.stock = item.stock - counterCount
        setStock(itemToChange.stock)
        setData(newData);
    } 
    //Se elimina toda la quantity de productos del carrito
    const handleRemove = (item) => {
        cart.splice(
            cart.findIndex((p) => p.id === item.id),
            1
        );
        setCart([...cart]);
        setCartWidgetACC(cartWidgetACC - item.quantity)
        handleAddToStock(item)
    }
    //Se agrega al stock la quantity del producto eliminado en handleRemove ↑
    const handleAddToStock = (item) => {
        const newData = data
        const itemToChange =  newData.find((p) => p.id === item.id);
        itemToChange.stock +=  item.quantity
        setStock(itemToChange.stock)
        setData(newData);
    } 
    //Maneja el precio total de los productos en el carrito
    const handleTotal = () => {
        return cart.reduce((sum, p) => sum + p.totalPrice, 0)
    }
    //Maneja el counter del carrito para eliminar de a 1 quantity 
    const handleCartDecrement = (item) => {
        const getItemInCart = cart.find((p)=>p.id===item.id)
        getItemInCart.quantity -= 1
        getItemInCart.totalPrice -= getItemInCart.item.price
        setCart([...cart])
        const getItemInData = data.find((p)=>p.id===item.id)
        getItemInData.stock += 1
        setData([...data]) 
        setCartWidgetACC(cartWidgetACC - 1)
        if (item.quantity === 0 ) {
            cart.splice(
                cart.findIndex((p) => p.id === item.id),
                1
                )
                setCart([...cart]);
        }
    }
    //Maneja el counter del carrito para agregar de a 1 quantity
    //siempre y cuando este disponible en el stock total
    const handleCartIncrement = (item) => {
        if (item.stockInStore > item.quantity) {
            const getItemInCart = cart.find((p)=>p.id===item.id)
            getItemInCart.quantity += 1
            getItemInCart.totalPrice += getItemInCart.item.price
            setCartWidgetACC(cartWidgetACC - 1)
            setCart([...cart])
            const getItemInData = data.find((p)=>p.id===item.id)
            getItemInData.stock += 1
            setCartWidgetACC(cartWidgetACC + 1)
            setData([...data])
            setCartWidgetACC(cartWidgetACC + 1)
        }
    }
    //Maneja la eliminación de todos los productos con todas sus 
    //quantities 
    const handleClearAll = () => {
        cart.forEach(cp => {
            const newData = data
            const itemToChange = newData.find((dp)=>{return cp.id === dp.id})
            itemToChange.stock +=  cp.quantity
            setStock(itemToChange.stock)
            setData(newData); 
            setCart([])
            setCartWidgetACC(0)
        });
    }

    return(
        <Provider 
            value={{
                //DATA 
                data: data,
                setData: setData,
                loading: loading,
                setLoading: setLoading,
                stock: stock,
                setStock: setStock,
                added:added,
                setAdded: setAdded,
                handleAdd: handleAdd,
                cart: cart,
                handleRemove: handleRemove,
                cartWidgetACC: cartWidgetACC,
                counterCount: counterCount, 
                dispatchCount: dispatchCount,
                handleTotal: handleTotal,
                handleClearAll: handleClearAll,
                handleCartDecrement: handleCartDecrement,
                handleCartIncrement: handleCartIncrement
            }}
        >
            {children}
        </Provider>
    )
}

export default StoreProvider