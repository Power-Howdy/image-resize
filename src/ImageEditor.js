import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const ImageEditor = () => {
  const [images, setImages] = useState([]);
  const [resizingIndex, setResizingIndex] = useState(null);
  const editorRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const newImage = {
        src: reader.result,
        position: { x: 0, y: 0 },
        size: { width: 200, height: 200 },
      };

      setImages((prevImages) => [...prevImages, newImage]);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('index', index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const index = event.dataTransfer.getData('index');
    const offsetX = event.clientX - editorRef.current.offsetLeft;
    const offsetY = event.clientY - editorRef.current.offsetTop;

    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages[index].position = { x: offsetX, y: offsetY };
      return updatedImages;
    });
  };

  const handleResizeStart = (event, index) => {
    event.stopPropagation();
    setResizingIndex(index);
  };

  const handleResize = (event) => {
    if (resizingIndex !== null) {
      const offsetX = event.clientX - editorRef.current.offsetLeft;
      const offsetY = event.clientY - editorRef.current.offsetTop;

      setImages((prevImages) => {
        const updatedImages = [...prevImages];
        const width = offsetX - updatedImages[resizingIndex].position.x;
        const height = offsetY - updatedImages[resizingIndex].position.y;
        updatedImages[resizingIndex].size = { width, height };
        return updatedImages;
      });
    }
  };

  const handleResizeEnd = () => {
    setResizingIndex(null);
  };

  const handleSave = () => {
    html2canvas(editorRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'result.png';
      link.click();
    });
  };

  return (
    <div>
      <input type="file" onChange={handleImageUpload} />
      <div
        ref={editorRef}
        style={{
          position: 'relative',
          width: '500px',
          height: '500px',
          border: '1px solid black',
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseMove={handleResize}
        onMouseUp={handleResizeEnd}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={`Image ${index}`}
            draggable
            onDragStart={(event) => handleDragStart(event, index)}
            style={{
              position: 'absolute',
              top: image.position.y,
              left: image.position.x,
              width: image.size.width,
              height: image.size.height,
              border: resizingIndex === index ? '2px solid red' : 'none',
              cursor: resizingIndex === index ? 'nwse-resize' : 'move',
            }}
            onMouseDown={(event) => handleResizeStart(event, index)}
          />
        ))}
      </div>
      <button onClick={handleSave}>Save as PNG</button>
    </div>
  );
};

export default ImageEditor;