import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./components/ui/button";
import { useState } from "react";
import {
  CircleCheck,
  CircleMinus,
  CirclePlus,
  CircleX,
  ShoppingCart,
} from "lucide-react";

async function fetchProducts() {
  const { data: products } = await axios.get("http://localhost:8001/products");
  return products;
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
        {children}
        <Button onClick={onClose} className="mt-4 rounded-full text-xs">
          Start New Order
        </Button>
      </div>
    </div>
  );
}

function App() {
  const [productsInCart, setProductsInCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  function handleAddToCart(product) {
    setProductsInCart((prev) => {
      const existingProduct = prev.find((item) => item.name === product.name);
      if (existingProduct) {
        return prev.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  }

  function handleIncrementQuantity(product) {
    setProductsInCart((prev) =>
      prev.map((item) =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function handleDecrementQuantity(product) {
    setProductsInCart((prev) =>
      prev
        .map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function handleRemoveFromCart(productToRemove) {
    setProductsInCart((prev) =>
      prev.filter((product) => product.name !== productToRemove.name)
    );
  }

  function handleConfirmOrder() {
    setIsModalOpen(true);
  }

  return (
    <div className="bg-[#FCF8F5] p-12 flex justify-center items-start">
      <div className="basis-3/4">
        <h1 className="pb-4 text-xl font-bold text-[#251512]">Desserts</h1>
        <div className="grid grid-cols-3 gap-4">
          {products.map((product) => {
            const inCart = productsInCart.find(
              (item) => item.name === product.name
            );
            return (
              <div key={product.name}>
                <div className="relative mb-6">
                  {inCart ? (
                    <img
                      src={product.image.desktop}
                      alt={product.name}
                      className="w-full rounded border-2 border-[#C83C0E]"
                    />
                  ) : (
                    <img
                      src={product.image.desktop}
                      alt={product.name}
                      className="w-full rounded"
                    />
                  )}
                  {inCart ? (
                    <div className="bg-[#C83C0E] absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 text-xs w-2/3 flex justify-between items-center rounded-full">
                      <Button
                        onClick={() => handleDecrementQuantity(product)}
                        className="text-xs"
                        variant="secondary"
                      >
                        <CircleMinus />
                      </Button>
                      <span className="mx-2 text-white font-bold">
                        {inCart.quantity}
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => handleIncrementQuantity(product)}
                        className="text-xs"
                      >
                        <CirclePlus />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      onClick={() => handleAddToCart(product)}
                      className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 text-xs w-2/3"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2 text-[#C83C0E]" />{" "}
                      Add To Cart
                    </Button>
                  )}
                </div>
                <h2 className="text-xs text-gray-400">{product.name}</h2>
                <p className="text-xs font-bold">{product.category}</p>
                <p className="text-xs text-[#C83C0E] font-bold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white w-80 p-4 ml-8 basis-1/4 rounded">
        <h2 className="font-bold text-[#C83C0E] mb-2">
          Your Cart ({productsInCart.length})
        </h2>
        <div className="space-y-2">
          {productsInCart.map((product, index) => (
            <>
              <div className="flex justify-between" key={index}>
                <div>
                  <h2 className="text-xs font-bold mb-1">{product.name}</h2>
                  <div className="flex">
                    <p className="text-xs pr-2 font-bold text-[#C83C0E]">
                      x{product.quantity}
                    </p>
                    <p className="text-xs pr-2 text-gray-400">
                      ${product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      ${(product.price * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => handleRemoveFromCart(product)}
                  className="cursor-pointer flex justify-center items-center"
                >
                  <CircleX className="h-4 w-4" />
                </div>
              </div>
              <hr />
            </>
          ))}
        </div>
        <div className="flex justify-between mt-4 mb-4">
          <p className="text-xs flex items-center">Order Total</p>
          <p className="text-xl font-bold">
            $
            {productsInCart
              .reduce(
                (total, product) => total + product.price * product.quantity,
                0.0
              )
              .toFixed(2)}
          </p>
        </div>
        <Button onClick={handleConfirmOrder}>Confirm Order</Button>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CircleCheck className="text-green-600 w-10 h-10 mb-4" />
        <h2 className="text-3xl font-bold mb-2">Order Confirmed</h2>
        <p className="text-xs mb-2">We hope you enjoy your food!</p>
        <div className="bg-[#FCF8F5] rounded p-4">
          {productsInCart.map((product, index) => (
            <>
              <div className="flex justify-between" key={index}>
                <div className="flex">
                  <img
                    src={product.image.thumbnail}
                    alt=""
                    className="w-12 rounded mr-4"
                  />
                  <div className="flex flex-col justify-between">
                    <h2 className="text-xs font-bold">{product.name}</h2>
                    <div className="flex">
                      <p className="text-xs pr-2 font-bold text-[#C83C0E]">
                        x{product.quantity}
                      </p>
                      <p className="text-xs pr-2 text-gray-400">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className=" flex items-center justify-center">
                  ${(product.price * product.quantity).toFixed(2)}
                </p>
              </div>
              <hr className="mt-3 mb-3" />
            </>
          ))}
          <div className="flex justify-between">
            <p className="text-xs flex items-center">Order Total</p>
            <p className="text-xl font-bold">
              $
              {productsInCart
                .reduce(
                  (total, product) => total + product.price * product.quantity,
                  0.0
                )
                .toFixed(2)}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
