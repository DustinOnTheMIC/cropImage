import logo from './logo.svg';
import './App.css';
import CropImage from './cropImage/cropImage';

function App() {
  const handleDownloadCropFile = blob => {
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'img.png';
    link.click();
  }

  return (
    <CropImage imgUrl='https://i.pinimg.com/236x/16/22/31/162231131a07dda331e720811b87f9d8.jpg' onChange={handleDownloadCropFile} />
  );
}

export default App;
