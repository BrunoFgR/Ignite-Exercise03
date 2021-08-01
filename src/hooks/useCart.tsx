import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart) as Product[];
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const stock = await api.get(`/stock/${productId}`);
      const productExists = cart.find(product => product.id === productId);
      let productUpdated: Product[] = [];

      if (productExists) {
        if (productExists.amount >= stock.data.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }

  
        productUpdated = cart.map(product => {
          if (product.id === productId) {
            Object.assign(product, {
              ...product,
              amount: product.amount + 1
            });

            return product;
          }

          return product;
        });
      } else {
        const product = await api.get(`/products/${productId}`);

        Object.assign(product.data, {
          ...product.data,
          amount: 1,
        });

        productUpdated = [ ...cart, product.data ]
      }

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(productUpdated))

      setCart(productUpdated)
    } catch {
      toast.error('Erro na adição do produto')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const removeProduct = cart.filter(product => product.id !== productId);
      const productExists = cart.find(product => product.id === productId);

      if(!productExists){
        throw new Error()
      }

      setCart(removeProduct);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(removeProduct));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if(amount <= 0){
      return;
    }

    try {
      const stock = await api.get(`/stock/${productId}`);

      if (amount > stock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const cartUpdated = cart.map(product => {
        if(product.id === productId) {
          Object.assign(product, {
            ...product,
            amount
          });

          return product;
        }

        return product;
      })

      setCart(cartUpdated)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cartUpdated));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
