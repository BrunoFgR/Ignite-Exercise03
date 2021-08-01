import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@Rocketseat:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart) as Product[];
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const [product, stock] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/stock/${productId}`),
      ])

      const productExist = cart.find(p => p.id === productId);

      if (!productExist) {
        Object.assign(product.data, {
          ...product.data,
          amount: 1,
        })

        localStorage.setItem('@Rocketseat:cart', JSON.stringify([...cart, product.data]))

        setCart([
          ...cart,
          product.data,
        ])
      } else {
        const updateProductAmount = cart.map(product => {
          if (product.id === productId) {
            Object.assign(product, {
              ...product,
              amount: (product.amount || 0) + 1,
            })
          }

          return product;
        });

        localStorage.setItem('@Rocketseat:cart', JSON.stringify(updateProductAmount));

        setCart(updateProductAmount);
      }
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
