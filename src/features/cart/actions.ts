'use server';
import { cookies } from 'next/headers';
import { addItem as addItemApi, updateItem as updateItemApi, removeItem as removeItemApi, applyCoupon as applyCouponApi, removeCoupon as removeCouponApi, selectShipping as selectShippingApi, prepareCheckout as prepareCheckoutApi } from './api';

export async function addItemAction(payload: { sku: string; quantity: number; variant?: Record<string,string> }){
  return addItemApi(payload); // cookies first‑party cobrem a autenticação do carrinho
}

export async function updateItemAction(itemId: string, payload: { quantity?: number; variant?: Record<string,string> }){
  return updateItemApi(itemId, payload);
}

export async function removeItemAction(itemId: string){
  return removeItemApi(itemId);
}

export async function applyCouponAction(code: string){
  return applyCouponApi(code);
}

export async function removeCouponAction(code: string){
  return removeCouponApi(code);
}

export async function selectShippingAction(input: { serviceCode: string; address?: Record<string, any> }){
  return selectShippingApi(input);
}

export async function prepareCheckoutAction(){
  return prepareCheckoutApi();
}
