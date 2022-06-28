import React, { useEffect, useRef, useState } from 'react';
import './cropImage.scss';
import PropTypes from 'prop-types';

const MIN_SIDE_CROP = 50

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
    top: -1000,
    left: 0,
    size: MIN_SIDE_CROP,
  })

  const [imgFullSize, setImgFullSize] = useState({
    height: 0,
    width: 0
  })
  const [containerSize, setContainerSize] = useState({
    height: 0,
    width: 0
  })

  useEffect(() => {
    const obContainer = new ResizeObserver(entries => {
      setImgFullSize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      })
    })

    const obImgFullSize = new ResizeObserver(entries => {
      setContainerSize({
        width: entries[0].contentRect.width,
        height: entries[0].contentRect.height
      })
    })
    obContainer.observe(imageFullSizeRef?.current)
    obImgFullSize.observe(containerRef?.current)
    return () => {
      obContainer?.disconect()
      obImgFullSize?.disconect()
    }
  }, [])

useEffect(() => {
    if (imgFullSize?.width && imgFullSize?.height && containerSize?.width && containerSize?.height) {
      const rectCtn = containerRef.current?.getBoundingClientRect()
      const maxWidth = rectCtn?.width
      const maxHeight = rectCtn?.height
      const imgHeight = containerSize.width * imgFullSize.height / imgFullSize.width
      const imgWidth = containerSize.height * imgFullSize.width / imgFullSize.height
      if ((containerSize.width / imgFullSize.width) / (containerSize.height / imgFullSize.height) > 1) {
        let size = imgWidth
        let left = (containerSize.width - imgWidth) / 2
        let top = containerSize.height / 2 - size / 2
        if (top + size > maxHeight) {
          size = maxHeight
          top = containerSize.height / 2 - size / 2
          left = (containerSize.width - size) / 2
        }
        setGridPosition(
          {
            top,
            size,
            left
          }
        )
      } else {
        let size = imgHeight
        let top = (containerSize.height - imgHeight) / 2
        let left = containerSize.width / 2 - size / 2
        if (top + size > maxWidth) {
          size = imgHeight > imgWidth ? imgWidth : imgHeight
          left = containerSize.width / 2 - size / 2
          top = (containerSize.height - size) / 2
        }
        setGridPosition(
          {
            top,
            size,
            left
          }
        )
      }
    }
  }, [imgFullSize?.height, imgFullSize.width, containerSize.height, containerSize.width])

  useEffect(() => {
    document.onmouseup = () => {
      handleMouseUp()
    }

    return () => {
      document.onmouseup = () => { }
    }
  }, [])

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

    const rectCtn = containerRef.current?.getBoundingClientRect()
    startMovingPositionRef.current = {
      x: e.clientX || (e.targetTouches[0].clientX - rectCtn.x),
      y: e.clientY || (e.targetTouches[0].clientY - rectCtn.y)
    }
  }

  const handleMouseDownCrop = (e) => {
    startBoundRef.current = {
      x1: cropRef.current?.offsetLeft || 0,
      y1: cropRef.current?.offsetTop || 0,
      x2: (cropRef.current?.offsetLeft || 0) + (cropRef.current?.getBoundingClientRect()?.width || 0),
      y2: (cropRef.current?.offsetTop || 0) + (cropRef.current?.getBoundingClientRect()?.height || 0)
    }
    const rectCtn = containerRef.current?.getBoundingClientRect()
    startMovingPositionRef.current = {
      x: e.clientX || (e.targetTouches[0].clientX - rectCtn?.x),
      y: e.clientY || (e.targetTouches[0].clientY - rectCtn?.y)
    }
    isMovingRef.current = true
    cropRef.current.style.pointerEvents = 'none'
  }

  const handleMouseMove = (e) => {
    if (isDraggingRef.current) {
      if (
        (currentPointPropertyRef?.current?.x === 'x2' && currentPointPropertyRef?.current?.y === 'y1') ||
        (currentPointPropertyRef?.current?.x === 'x1' && currentPointPropertyRef?.current?.y === 'y2')
      ) {
        containerRef.current.style.cursor = ' nesw-resize'
      } else {
        containerRef.current.style.cursor = 'nwse-resize'
      }
      const rectCtn = containerRef.current?.getBoundingClientRect()
      const maxWidth = rectCtn?.width
      const maxHeight = rectCtn?.height
      let x = +e.nativeEvent.offsetX
      let y = +e.nativeEvent.offsetY
      if (!x && !y) {
        x = e.targetTouches[0].clientX - rectCtn?.x;
        y = e.targetTouches[0].clientY - rectCtn?.y
      }

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
        if (
          newBound.x2 - newBound.x1 >= MIN_SIDE_CROP &&
          newBound.x2 <= maxWidth &&
          newBound.y1 >= 0 &&
          newBound.x1 >= 0 &&
          newBound.y2 <= maxHeight
        ) {
          setGridPosition(({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 }))
        }
      }
    }

    if (isMovingRef.current && !isMovingSideRef.current) {
      containerRef.current.style.cursor = 'move'
      const rectCtn = containerRef.current?.getBoundingClientRect()
      const maxWidth = rectCtn?.width
      const maxHeight = rectCtn?.height

      const x = e.clientX || (e.targetTouches[0].clientX - rectCtn.x)
      const y = e.clientY || (e.targetTouches[0].clientY - rectCtn.y)
      let dMoveX = x - startMovingPositionRef.current.x
      let dMoveY = y - startMovingPositionRef.current.y
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
      setGridPosition(({ size: size, top: top, left: left }))
    }

    if (isMovingSideRef.current) {
      const rectCtn = containerRef.current?.getBoundingClientRect()

      const maxWidth = rectCtn?.width
      const maxHeight = rectCtn?.height

      let x = +e.nativeEvent.offsetX || (e.targetTouches[0].clientX - rectCtn.x)
      let y = +e.nativeEvent.offsetY || (e.targetTouches[0].clientY - rectCtn.y)

      if (movingSideRef.current === 'top') {
        containerRef.current.style.cursor = 's-resize'
        const dy = y - startBoundRef.current.y1
        const newBound = { ...startBoundRef.current }
        newBound.y1 = y
        newBound.x2 = startBoundRef.current.x2 - dy
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.x2 <= maxWidth && newBound.y1 >= 0) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      } else if (movingSideRef.current === 'left') {
        containerRef.current.style.cursor = 'w-resize'
        const dx = x - startBoundRef.current.x1
        const newBound = { ...startBoundRef.current }
        newBound.x1 = x
        newBound.y2 = startBoundRef.current.y2 - dx
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.y2 <= maxHeight && newBound.x1 >= 0) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      } else if (movingSideRef.current === 'right') {
        containerRef.current.style.cursor = 'w-resize'
        const dx = x - startBoundRef.current.x2
        const newBound = { ...startBoundRef.current }
        newBound.x2 = x
        newBound.y2 = startBoundRef.current.y2 + dx
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.y2 <= maxHeight && newBound.x2 <= maxWidth) {
          setGridPosition({ size: newBound.x2 - newBound.x1, top: newBound.y1, left: newBound.x1 })
        }
      } else {
        containerRef.current.style.cursor = 's-resize'
        const dy = y - startBoundRef.current.y2
        const newBound = { ...startBoundRef.current }
        newBound.y2 = y
        newBound.x2 = startBoundRef.current.x2 + dy
        const size = newBound.x2 - newBound.x1
        if (size >= MIN_SIDE_CROP && newBound.x2 <= maxWidth && newBound.y2 <= maxHeight) {
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
    const containerHeight = containerRef.current.clientHeight

    const cropWidth = cropRef.current.clientWidth
    const cropHeight = cropRef.current.clientHeight


    const imgFullSizeWidth = imageFullSizeRef.current.clientWidth
    const imgFullSizeHeight = imageFullSizeRef.current.clientHeight

    let imgWidth = containerWidth
    let imgHeight = containerHeight

    if ((containerWidth / imgFullSizeWidth) / (containerHeight / imgFullSizeHeight) > 1) {
      imgWidth = (containerHeight / imgFullSizeHeight) * imgFullSizeWidth
    } else {
      imgHeight = (containerWidth / imgFullSizeWidth) * imgFullSizeHeight
    }

    const leftImg = containerWidth - imgWidth != 0 ? (containerWidth - imgWidth) / 2 : 0
    const topImg = containerHeight - imgHeight !== 0 ? (containerHeight - imgHeight) / 2 : 0

    const x = cropRef.current.offsetLeft
    const y = cropRef.current.offsetTop

    const realY = y - topImg !== 0 ? imgFullSizeHeight * (y - topImg) / imgHeight : 0
    const realX = x - leftImg !== 0 ? imgFullSizeWidth * (x - leftImg) / imgWidth : 0

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
    onClose()
  }

  let clipStyle = `polygon(${gridPosition.left}px ${gridPosition.top}px, ${gridPosition.left + gridPosition.size}px ${gridPosition.top}px, ${gridPosition.left + gridPosition.size}px ${gridPosition.top + gridPosition.size}px, ${gridPosition.left}px ${gridPosition.top + gridPosition.size}px)`
  return (
    <>
      <canvas ref={canvasRef} className='canvasCrop'></canvas>
      <div className='containerFixedCropImage'>
        <div className='cropImageContainer' >
          <div className='cropImageHeader'>
            <button className='btnBackCrop'>
            </button>
            <div>
              Cắt ảnh
            </div>
            <button className='btnCloseCrop' onClick={handleClosePopup}>
              <svg id="Group_14802" data-name="Group 14802" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" style={{transform: 'translate(-3px, -10px)'}}>
                <path id="Path_8069" data-name="Path 8069" d="M0,0H18V18H0Z" fill="none" />
                <path id="Path_8070" data-name="Path 8070" d="M10.409,9.349l3.713-3.713L15.182,6.7,11.47,10.409l3.713,3.713-1.061,1.061L10.409,11.47,6.7,15.182,5.636,14.122l3.712-3.712L5.636,6.7,6.7,5.636Z" transform="translate(-1.409 -1.409)" fill="#FFFFFF" />
              </svg>
            </button>
          </div>
          <div
            className="image-wrapper-inner full-size"
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onClick={handleMouseUp}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleMouseMove}
            style={{
              backgroundImage: `url(${imgUrl})`
            }}
          >
            <img style={{
              clipPath: clipStyle
            }} src={imgUrl} className="target-image" ref={imageRef} crossOrigin="anonymous" />
            <img src={imgUrl} className="target-image-full-size" ref={imageFullSizeRef} crossOrigin="anonymous" />
            <div
              ref={cropRef}
              className="cropDiv makeGrid"
              onMouseDown={handleMouseDownCrop}
              onTouchStart={handleMouseDownCrop}
              style={{ top: `${gridPosition.top}px`, left: `${gridPosition.left}px`, width: `${gridPosition.size}px`, height: `${gridPosition.size}px` }}
            >
              <div className='top' onMouseDown={handleMouseDownSide} onTouchStart={handleMouseDownSide}></div>
              <div className='right' onMouseDown={handleMouseDownSide} onTouchStart={handleMouseDownSide}></div>
              <div className='left' onMouseDown={handleMouseDownSide} onTouchStart={handleMouseDownSide}></div>
              <div className='bottom' onMouseDown={handleMouseDownSide} onTouchStart={handleMouseDownSide}></div>

              <div className="grid-item">
                <div className='resizer x1 y1' onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}></div>
              </div>
              <div className="grid-item"></div>
              <div className="grid-item">
                <div className='resizer x2 y1' onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}></div>
              </div>

              <div className="grid-item"></div>
              <div className="grid-item"></div>
              <div className="grid-item"></div>

              <div className="grid-item">
                <div className='resizer x1 y2' onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}></div>
              </div>
              <div className="grid-item"></div>
              <div className="grid-item">
                <div className='resizer x2 y2' onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}></div>
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

CropImage.propTypes = {
  imgUrl: PropTypes.string,
  onChange: PropTypes.func,
  onClose: PropTypes.func
};

export default CropImage;
