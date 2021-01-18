import React, { useContext, useState, useEffect } from 'react';
import {getFirestore} from '../../firebase'
import {useParams} from 'react-router-dom'
//Context
import {StoreContext} from '../../context/StoreContext'
//Components
import ItemList from '../itemList/ItemList'
import Loading from '../loading/Loading'
//SCSS
import './itemListContainer.scss';



const ItemListContainer = () => {

    const {loading, setLoading } = useContext(StoreContext)
    const [data, setData] = useState([])
    const {id} = useParams()

    useEffect(() => {
        setLoading(true)
        setData([])
        const db = getFirestore()
        const itemsCollection = db.collection('items')
        if (id) {
            const query = itemsCollection.where("category", "==", id);
            query.get()
            .then((querySnapshot)=>{
                /* setCategoryQuery([]) */
                querySnapshot.forEach(function(doc) {
                    const dataRes = doc.data()
                    setData(data => [...data, dataRes])
                });
            })
        } else {
            itemsCollection.get()
            .then((querySnapshot)=> {
                querySnapshot.forEach(function(doc) {
                    const dataRes = doc.data()
                    setData(data => [...data, dataRes])
                });
            })
        }
        setLoading(false)
    }, [id])

    return(
        <div className="container item_list_container">
            { loading ? 
                <Loading /> 
                : data.map((product)=>{ 
                    return(<ItemList
                        key={product.id}
                        item={{
                            id: product.id,
                            name: product.name,
                            imageUrl: product.imageUrl,
                            price: product.price,
                            stock:product.stock
                        }}
                    />)
                })
            }
        </div>
    )
}

export default ItemListContainer;