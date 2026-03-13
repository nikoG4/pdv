import { NoImageIcon } from './icons';

const ProductImage = ({ src, alt, className = '' }) => {
  if (!src) {
    return (
      <div className={`flex items-center justify-center rounded-md bg-gray-100 text-gray-400 ${className}`}>
        <NoImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-md object-cover bg-gray-100 ${className}`}
    />
  );
};

export default ProductImage;
