import { FaPlus } from 'react-icons/fa';

export default function MenuGrid({ products = [], onAdd, isDisabled = false }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {products.map((item, index) => {
        const isItemDisabled = isDisabled || item.status === 'Not Available';

        return (
          <div
            key={item.id ?? item._id ?? index}
            className="relative flex items-center bg-white rounded shadow p-6"
          >
            <div className="flex-1 pr-4">
              <h3 className="text-base font-semibold mb-1">{item.name}</h3>
              {item.shortDescription && (
                <p className="text-gray-600 mb-3 text-xs">{item.shortDescription}</p>
              )}
              <p className="text-base font-bold">Rs. {item.price}</p>

              {item.status === 'Not Available' && (
                <p className="text-red-600 text-xs font-semibold mt-2">Not Available</p>
              )}
            </div>

            <div className="relative">
              <img
                src={`http://localhost:5000/uploads/menu_images/${item.image}`}
                alt={item.name}
                className={`h-28 w-36 object-cover rounded-lg cursor-pointer transition hover:opacity-80 ${
                  isItemDisabled ? 'pointer-events-none opacity-50' : ''
                }`}
                onClick={() => !isItemDisabled && onAdd(item)} 
                title={
                  item.status === 'Not Available'
                    ? 'Item is Not Available'
                    : isDisabled
                    ? 'Restaurant is Offline'
                    : 'Click to add to basket'
                }
              />

              <button
                onClick={() => !isItemDisabled && onAdd(item)}
                disabled={isItemDisabled}
                className={`absolute bottom-2 right-2 p-2 rounded-full shadow transition ${
                  isItemDisabled
                    ? 'bg-gray-300 text-white cursor-not-allowed'
                    : 'bg-black text-white hover:bg-orange-400 hover:text-black'
                }`}
                title={
                  item.status === 'Not Available'
                    ? 'Item is Not Available'
                    : isDisabled
                    ? 'Restaurant is Offline'
                    : 'Add to basket'
                }
              >
                <FaPlus />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
