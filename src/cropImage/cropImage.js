import React, { useEffect, useRef, useState } from 'react';
import './cropImage.css';

const MIN_SIDE_CROP = 200

const CropImage = ({ imgUrl = '', onChange, onClose }) => {
  const imageRef = useRef()
  const imageFullSizeRef = useRef()
  const cropRef = useRef()
  const containerRef = useRef()
  const isDraggingRef = useRef(false)
  const isMovingRef = useRef(false)
  const isMovingSideRef = useRef(false)
  const canvasRef = useRef()
  const movingSideRef = useRef('top')

  const [disableBtnCrop, setDisableBtnCrop] = useState(false)
  const startBoundRef = useRef({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0
  })
  const startMovingPositionRef = useRef({
    x: 0,
    y: 0
  })
  const currentPointPropertyRef = useRef({
    x: "x1",
    y: "y1"
  })

  const [gridPosition, setGridPosition] = useState({
    top: 0,
    left: 0,
    size: MIN_SIDE_CROP,
  })

  useEffect(() => {
    document.onmouseup = () => {
      handleMouseUp()
    }

    return () => {
      document.onmouseup = () => { }
    }
  }, [])

  const cancelEffect = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleMouseDown = (e) => {
    e.stopPropagation()
    currentPointPropertyRef.current = {
      x: e.target.classList[1],
      y: e.target.classList[2]
    }
    startBoundRef.current = {
      x1: cropRef.current?.offsetLeft || 0,
      y1: cropRef.current?.offsetTop || 0,
      x2: (cropRef.current?.offsetLeft || 0) + (cropRef.current?.getBoundingClientRect()?.width || 0),
      y2: (cropRef.current?.offsetTop || 0) + (cropRef.current?.getBoundingClientRect()?.height || 0)
    }
    cropRef.current.style.pointerEvents = 'none'
    isDraggingRef.current = true
  }

  const handleMouseDownSide = e => {
    isMovingSideRef.current = true
    movingSideRef.current = e.target.classList[0]

    startBoundRef.current = {
      x1: cropRef.current?.offsetLeft || 0,
      y1: cropRef.current?.offsetTop || 0,
      x2: (cropRef.current?.offsetLeft || 0) + (cropRef.current?.getBoundingClientRect()?.width || 0),
      y2: (cropRef.current?.offsetTop || 0) + (cropRef.current?.getBoundingClientRect()?.height || 0)
    }

    startMovingPositionRef.current = {
      x: e.clientX,
      y: e.clientY
    }
  }

  const handleMouseDownCrop = (e) => {
    startBoundRef.current = {
      x1: cropRef.current?.offsetLeft || 0,
      y1: cropRef.current?.offsetTop || 0,
      x2: (cropRef.current?.offsetLeft || 0) + (cropRef.current?.getBoundingClientRect()?.width || 0),
      y2: (cropRef.current?.offsetTop || 0) + (cropRef.current?.getBoundingClientRect()?.height || 0)
    }
    startMovingPositionRef.current = {
      x: e.clientX,
      y: e.clientY
    }
    isMovingRef.current = true
    cropRef.current.style.pointerEvents = 'none'
  }

  const handleMouseMove = (e) => {
    cancelEffect(e)
    if (isDraggingRef.current) {
      if (
        (currentPointPropertyRef?.current?.x === 'x2' && currentPointPropertyRef?.current?.y === 'y1') ||
        (currentPointPropertyRef?.current?.x === 'x1' && currentPointPropertyRef?.current?.y === 'y2')
      ) {
        containerRef.current.style.cursor = ' nesw-resize'
      } else {
        containerRef.current.style.cursor = 'nwse-resize'
      }

      const x = +e.nativeEvent.offsetX
      const y = +e.nativeEvent.offsetY
      const dx = x - startBoundRef.current[currentPointPropertyRef.current.x]
      const dy = y - startBoundRef.current[currentPointPropertyRef.current.y]
      let newBound = { ...startBoundRef.current }
      newBound[currentPointPropertyRef.current.x] = x
      newBound[currentPointPropertyRef.current.y] = y
      let sizeX = newBound.x2 - newBound.x1
      let sizeY = newBound.y2 - newBound.y1
      if (sizeX >= MIN_SIDE_CROP && sizeY >= MIN_SIDE_CROP) {
        if (sizeX < sizeY) {
          newBound[currentPointPropertyRef.current.x] = x
          newBound[currentPointPropertyRef.current.y] = startBoundRef.current[currentPointPropertyRef.current.y] + dx
          if ((newBound.y2 - newBound.y1) != sizeX) {
            newBound[currentPointPropertyRef.current.y] = newBound[currentPointPropertyRef.current.y] - 2 * dx
          }
        }
        else {
          newBound[currentPointPropertyRef.current.y] = y
          newBound[currentPointPropertyRef.current.x] = startBoundRef.current[currentPointPropertyRef.current.x] + dy
          if ((newBound.x2 - newBound.x1) != sizeY) {
            newBound[currentPointPropertyRef.current.x] = newBound[currentPointPropertyRef.current.x] - 2 * dy
          }
        }
        setGridPosition(prev => ({ ...prev, size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 }))
      }
    }

    if (isMovingRef.current && !isMovingSideRef.current) {
      containerRef.current.style.cursor = 'move'
      const maxWidth = containerRef.current?.getBoundingClientRect()?.width
      const maxHeight = containerRef.current?.getBoundingClientRect()?.height
      let dMoveX = e.clientX - startMovingPositionRef.current.x
      let dMoveY = e.clientY - startMovingPositionRef.current.y
      let size = startBoundRef.current.x2 - startBoundRef.current.x1
      let top = startBoundRef.current.y1 + dMoveY
      let left = startBoundRef.current.x1 + dMoveX
      let right = left + size
      let bottom = top + size
      if (right > maxWidth) {
        left = maxWidth - size
      }
      if (left < 0) {
        left = 0
      }
      if (bottom > maxHeight) {
        top = maxHeight - size
      }
      if (top < 0) {
        top = 0
      }
      setGridPosition(prev => ({ ...prev, size: size, top: top, left: left }))
    }

    if (isMovingSideRef.current) {
      const x = +e.nativeEvent.offsetX
      const y = +e.nativeEvent.offsetY
      const maxWidth = containerRef.current?.getBoundingClientRect()?.width
      const maxHeight = containerRef.current?.getBoundingClientRect()?.height

      if (movingSideRef.current === 'top') {
        containerRef.current.style.cursor = 's-resize'
        const dy = y - startBoundRef.current.y1
        const newBound = { ...startBoundRef.current }
        newBound.y1 = y
        newBound.x2 = startBoundRef.current.x2 - dy
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.x2 <= maxWidth) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      } else if (movingSideRef.current === 'left') {
        containerRef.current.style.cursor = 'w-resize'
        const dx = x - startBoundRef.current.x1
        const newBound = { ...startBoundRef.current }
        newBound.x1 = x
        newBound.y2 = startBoundRef.current.y2 - dx
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.y2 <= maxHeight) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      } else if (movingSideRef.current === 'right') {
        containerRef.current.style.cursor = 'w-resize'
        const dx = x - startBoundRef.current.x2
        const newBound = { ...startBoundRef.current }
        newBound.x2 = x
        newBound.y2 = startBoundRef.current.y2 + dx
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.y2 <= maxHeight) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      } else {
        containerRef.current.style.cursor = 's-resize'
        const dy = y - startBoundRef.current.y2
        const newBound = { ...startBoundRef.current }
        newBound.y2 = y
        newBound.x2 = startBoundRef.current.x2 + dy
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.x2 <= maxWidth) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      }
    }
  }

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
    }

    if (isMovingRef.current) {
      isMovingRef.current = false
    }

    if (isMovingSideRef.current) {
      isMovingSideRef.current = false
    }
    cropRef?.current && (cropRef.current.style.pointerEvents = 'auto')
    containerRef?.current && (containerRef.current.style.cursor = 'auto')
    containerRef?.current && (containerRef.current.style.cursor = 'auto')
  }

  const handleApply = () => {
    setDisableBtnCrop(true)

    const containerWidth = containerRef.current.clientWidth

    const cropWidth = cropRef.current.clientWidth
    const cropHeight = cropRef.current.clientHeight

    const imgWidth = imageRef.current.clientWidth
    const imgHeight = imageRef.current.clientHeight

    const imgFullSizeWidth = imageFullSizeRef.current.clientWidth
    const imgFullSizeHeight = imageFullSizeRef.current.clientHeight

    const leftImg = (containerWidth - imgWidth) / 2

    const x = cropRef.current.offsetLeft
    const y = cropRef.current.offsetTop

    const realY = y === 0 ? 0 : imgFullSizeHeight * y / imgHeight
    const realX = imgFullSizeWidth * (x - leftImg) / imgWidth

    const cropWidthImgFullSize = imgFullSizeWidth * cropWidth / imgWidth

    const context = canvasRef.current.getContext('2d')
    const image = new Image()

    image.src = imgUrl
    image.crossOrigin = "anonymous"

    image.onload = () => {
      canvasRef.current.width = cropWidth
      canvasRef.current.height = cropHeight
      context.drawImage(image, realX, realY, cropWidthImgFullSize, cropWidthImgFullSize, 0, 0, cropWidth, cropWidth)

      canvasRef.current.toBlob(
        blob => {
          onChange && onChange(blob)
          setDisableBtnCrop(false)
        }
      )
    }
  }

  const handleClosePopup = () => {
    onClose && onClose()
  }

  return (
    <>
      <canvas ref={canvasRef} className='canvasCrop'></canvas>
      <div className='containerFixed'>
        <div className='cropImageContainer' >
          <div className='cropImageHeader'>
            <button className='btnBackCrop'>
              &#10140;
            </button>
            <div>
              Cắt ảnh
            </div>
            <button className='btnCloseCrop' onClick={handleClosePopup}>
              &times;
            </button>
          </div>
          <div
            className="image-wrapper-inner full-size"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleMouseUp}
            onMouseDown={cancelEffect}
          >
            <img src={imgUrl} className="target-image" ref={imageRef} crossOrigin="anonymous" />
            <img src={imgUrl} className="target-image-full-size" ref={imageFullSizeRef} crossOrigin="anonymous" />
            <div
              ref={cropRef}
              className="cropDiv makeGrid"
              onMouseDown={handleMouseDownCrop}
              style={{ top: `${gridPosition.top}px`, left: `${gridPosition.left}px`, width: `${gridPosition.size}px`, height: `${gridPosition.size}px` }}
            >
              <div className='top' onMouseDown={handleMouseDownSide}></div>
              <div className='right' onMouseDown={handleMouseDownSide}></div>
              <div className='left' onMouseDown={handleMouseDownSide}></div>
              <div className='bottom' onMouseDown={handleMouseDownSide}></div>

              <div className="grid-item">
                <div className='resizer x1 y1' onMouseDown={handleMouseDown}></div>
              </div>
              <div className="grid-item"></div>
              <div className="grid-item">
                <div className='resizer x2 y1' onMouseDown={handleMouseDown}></div>
              </div>

              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>

              <div className="grid-item">
                <div className='resizer x1 y2' onMouseDown={handleMouseDown}></div>
              </div>
              <div className="grid-item"></div>
              <div className="grid-item">
                <div className='resizer x2 y2' onMouseDown={handleMouseDown}></div>
              </div>
            </div>
          </div>

          <div className='cropImageFooter'>
            <button onClick={handleApply} className="btnApplyCrop" disabled={disableBtnCrop}>Lưu làm ảnh đại diện</button>
          </div>
        </div >
      </div>
    </>
  )
};

export default CropImage;
