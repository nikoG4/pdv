import { NoImageIcon } from './icons';
import axiosInstance from '../../services/axiosConfig';

const resolveImageUrl = (src) => {
  if (!src) {
    return '';
  }

  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }

  const apiBaseUrl = axiosInstance.defaults.baseURL || '';
  const serverBaseUrl = apiBaseUrl.endsWith('/api')
    ? apiBaseUrl.slice(0, -4)
    : apiBaseUrl;

  return `${serverBaseUrl}${src}`;
};

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
      src={resolveImageUrl(src)}
      alt={alt}
      className={`rounded-md object-cover bg-gray-100 ${className}`}
    />
  );
};

export default ProductImage;
