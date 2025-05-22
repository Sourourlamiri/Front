import React from 'react'
import {loadStripe} from '@stripe/stripe-js'
import { useParams } from 'react-router-dom'
const stripePromise=loadStripe('pk_test_51RFBIUGh10iY8VXbu6VIjFFwD4l88jMsSrMyn1mZdvqOK9m8498UlK50Yn8yvP83WEvmyYpHeAffMZZsolTncY920021bLbPJa')
const Payment = () => {
   const {id}=useParams()
   const handleCheckOut=async()=>{
    const stripe=await stripePromise;
try {
    const response=await fetch(`${process.env.REACT_APP_BACKEND_URL}/payement/create-checkout-session/${id}`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        }
    })
        const session=await response.json()
        if(session.id){
            const result=await stripe.redirectToCheckout({sessionId:session.id});
            if(result.error){
               alert(result.error.message)
            }
        }else{
            console.error('Failed to create session:', session)
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
      return (
        <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F4F4F4',
        }}
      >
        <button
          id="checkout-button"
          onClick={handleCheckOut}
          style={{
            backgroundColor: '#6772E5',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#555ABF')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#6772E5')}
        >
          Payer
        </button>
      </div>
  )
}
export default Payment