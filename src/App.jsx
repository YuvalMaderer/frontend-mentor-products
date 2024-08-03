import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "./components/ui/button";
import { useState } from "react";
import { CircleX, ShoppingCart } from "lucide-react";

async function fetchProducts() {
  const { data: products } = await axios.get("http://localhost:8001/products");
  return products;
}

function App() {
  const [productsInCart, setProductsInCart] = useState([]);

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

  function handleRemoveFromCart(productToRemove) {
    setProductsInCart((prev) =>
      prev
        .map((product) =>
          product.name === productToRemove.name
            ? { ...product, quantity: product.quantity - 1 }
            : product
        )
        .filter((product) => product.quantity > 0)
    );
  }

  return (
    <div className="bg-[#FCF8F5] p-12 flex justify-center items-start">
      <div>
        <h1 className="pb-4 text-xl font-bold text-[#251512]">Desserts</h1>
        <div className="grid grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.name}>
              <img
                src={product.image.thumbnail}
                alt={product.name}
                className="w-32 rounded"
              />
              <Button
                variant="ghost"
                onClick={() => handleAddToCart(product)}
                className="relative bottom-5 text-xs"
              >
                <ShoppingCart className="h-4 w-4 mr-2 text-[#C83C0E]" /> Add To
                Cart
              </Button>
              <h2 className="text-xs text-gray-400">{product.name}</h2>
              <p className="text-xs font-bold">{product.category}</p>
              <p className="text-xs text-[#C83C0E] font-bold">
                ${product.price}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white w-80 p-4 ml-8">
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
                      ${product.price}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">
                      ${product.price * product.quantity}
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
            {productsInCart.reduce(
              (total, product) => total + product.price * product.quantity,
              0
            )}
          </p>
        </div>
        <Button>Confirm Order</Button>
      </div>
    </div>
  );
}

export default App;
