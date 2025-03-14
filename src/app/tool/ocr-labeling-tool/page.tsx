"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, ImageIcon, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface BoundingBox {
  id: number
  x: number
  y: number
  width: number
  height: number
  label: string
}

interface ImageData {
  file: File
  url: string
  width: number
  height: number
  boxes: BoundingBox[]
}

export default function OCRLabelingTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<ImageData[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1)
  const [boxes, setBoxes] = useState<BoundingBox[]>([])
  const [currentBox, setCurrentBox] = useState<Partial<BoundingBox> | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Computed properties for current image
  const currentImage = currentImageIndex >= 0 ? images[currentImageIndex] : null
  const imageUrl = currentImage?.url || null
  const imageWidth = currentImage?.width || 0
  const imageHeight = currentImage?.height || 0

  // Mouse event handlers for drawing boxes
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Check if clicking on an existing box
    const clickedBox = boxes.find(
      (box) => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height,
    )

    if (clickedBox) {
      setSelectedBoxId(clickedBox.id)
      return
    }

    // Start drawing a new box
    setIsDrawing(true)
    setCurrentBox({ x, y, width: 0, height: 0 })
    setSelectedBoxId(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentBox || !imageLoaded) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    setCurrentBox({
      ...currentBox,
      width: x - (currentBox.x || 0),
      height: y - (currentBox.y || 0),
    })

    drawBoxes()
  }

  // Draw all boxes and the current box being drawn
  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")

    if (!ctx || !canvas || !imageUrl) return

    // Ensure canvas dimensions match image dimensions
    if (canvas.width !== imageWidth || canvas.height !== imageHeight) {
      canvas.width = imageWidth
      canvas.height = imageHeight
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing boxes
    boxes.forEach((box) => {
      ctx.strokeStyle = selectedBoxId === box.id ? "#ff0000" : "#00ff00"
      ctx.lineWidth = 2
      ctx.strokeRect(box.x, box.y, box.width, box.height)

      // Draw label
      if (box.label) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
        ctx.fillRect(box.x, box.y - 20, 20, 20)
        ctx.fillStyle = "#ffffff"
        ctx.font = "12px Arial"
        ctx.fillText(box.label, box.x + 5, box.y - 5)
      }
    })

    // Draw current box being created
    if (currentBox && isDrawing) {
      ctx.strokeStyle = "#0000ff"
      ctx.lineWidth = 2
      ctx.strokeRect(currentBox.x || 0, currentBox.y || 0, currentBox.width || 0, currentBox.height || 0)
    }
  }, [boxes, currentBox, imageHeight, imageUrl, imageWidth, isDrawing, selectedBoxId])

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Reset error state
    setError(null)

    // Process each file
    const newImages: ImageData[] = []
    
    for (const file of files) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setError("Please upload only image files")
        continue
      }

      try {
        // Create object URL for direct image display
        const objectUrl = URL.createObjectURL(file)
        
        // Get image dimensions
        const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            resolve({ width: img.width, height: img.height })
          }
          img.onerror = () => {
            reject(new Error("Failed to load image"))
          }
          img.src = objectUrl
        })

        newImages.push({
          file,
          url: objectUrl,
          width: dimensions.width,
          height: dimensions.height,
          boxes: [],
        })
      } catch (err) {
        console.error("Failed to process image:", file.name, err)
        URL.revokeObjectURL(imageUrl || "")
        setError(`Failed to load image: ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
      // If this is the first upload, set the current image index
      if (currentImageIndex === -1) {
        setCurrentImageIndex(0)
        setImageLoaded(true)
      }
    }
  }

  // Mouse event handlers for drawing boxes
  const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentBox || !imageLoaded) return

    // Only add box if it has some size
    if (currentBox.width && currentBox.height && Math.abs(currentBox.width) > 5 && Math.abs(currentBox.height) > 5) {
      // Normalize negative width/height
      let x = currentBox.x || 0
      let y = currentBox.y || 0
      let width = currentBox.width || 0
      let height = currentBox.height || 0

      if (width < 0) {
        x += width
        width = Math.abs(width)
      }

      if (height < 0) {
        y += height
        height = Math.abs(height)
      }

      const newBox: BoundingBox = {
        id: Date.now(),
        x,
        y,
        width,
        height,
        label: "",
      }

      // Create a new array with the new box
      const updatedBoxes = [...boxes, newBox]
      setBoxes(updatedBoxes)
      setSelectedBoxId(newBox.id)

      // Debug info
      setDebugInfo(`Added box #${updatedBoxes.length}: ${JSON.stringify(newBox)}`)
      console.log("Added new box:", newBox, "Total boxes:", updatedBoxes.length)
    }

    setIsDrawing(false)
    setCurrentBox(null)

    // Force redraw to ensure all boxes are displayed
    setTimeout(() => {
      drawBoxes()
    }, 0)
  }

  // Update label for selected box
  const updateLabel = (label: string) => {
    if (selectedBoxId === null) return

    setBoxes(boxes.map((box) => (box.id === selectedBoxId ? { ...box, label } : box)))
  }

  // Delete selected box
  const deleteSelectedBox = () => {
    if (selectedBoxId === null) return

    setBoxes(boxes.filter((box) => box.id !== selectedBoxId))
    setSelectedBoxId(null)
  }

  // Navigation functions
  const goToNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      // Save current boxes
      const updatedImages = [...images]
      if (currentImageIndex >= 0) {
        updatedImages[currentImageIndex] = { ...updatedImages[currentImageIndex], boxes }
      }
      setImages(updatedImages)
      
      // Move to next image
      const nextIndex = currentImageIndex + 1
      const nextImage = updatedImages[nextIndex]
      if (nextImage) {
        // Reset states before loading new image
        setImageLoaded(false)
        setBoxes([])
        setSelectedBoxId(null)
        setCurrentBox(null)
        setIsDrawing(false)
        
        // Create a new Image object to ensure dimensions are loaded
        const img = new Image()
        img.onload = () => {
          // Update current index and load image data only after dimensions are confirmed
          setCurrentImageIndex(nextIndex)
          setBoxes(nextImage.boxes || [])
          setImageLoaded(true)
          // Force canvas update after image is loaded
          if (canvasRef.current) {
            canvasRef.current.width = img.width
            canvasRef.current.height = img.height
            drawBoxes()
          }
        }
        img.src = nextImage.url
      }
    }
  }

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      // Save current boxes
      const updatedImages = [...images]
      if (currentImageIndex >= 0) {
        updatedImages[currentImageIndex] = { ...updatedImages[currentImageIndex], boxes }
      }
      setImages(updatedImages)
      
      // Move to previous image
      const prevIndex = currentImageIndex - 1
      const prevImage = updatedImages[prevIndex]
      if (prevImage) {
        // Reset states before loading new image
        setImageLoaded(false)
        setBoxes([])
        setSelectedBoxId(null)
        setCurrentBox(null)
        setIsDrawing(false)
        
        // Create a new Image object to ensure dimensions are loaded
        const img = new Image()
        img.onload = () => {
          // Update current index and load image data only after dimensions are confirmed
          setCurrentImageIndex(prevIndex)
          setBoxes(prevImage.boxes || [])
          setImageLoaded(true)
          // Force canvas update after image is loaded
          if (canvasRef.current) {
            canvasRef.current.width = img.width
            canvasRef.current.height = img.height
            drawBoxes()
          }
        }
        img.src = prevImage.url
      }
    }
  }

  // Remove an image and clean up its resources
  const removeImage = (index: number) => {
    if (index < 0 || index >= images.length) return

    // Save current boxes before removing
    const updatedImages = [...images]
    if (currentImageIndex >= 0) {
      updatedImages[currentImageIndex] = { ...updatedImages[currentImageIndex], boxes }
    }

    // Create new array without the removed image
    const newImages = [...updatedImages]
    const removed = newImages.splice(index, 1)[0]
    if (removed) {
      URL.revokeObjectURL(removed.url)
    }
    
    setImages(newImages)

    // Update current index if needed
    if (index === currentImageIndex) {
      if (index > 0 && newImages.length > 0) {
        const newIndex = index - 1
        // Reset states before loading new image
        setImageLoaded(false)
        setBoxes([])
        setSelectedBoxId(null)
        setCurrentBox(null)
        setIsDrawing(false)
        
        setCurrentImageIndex(newIndex)
        
        // Use timeout to ensure state updates before loading new image
        setTimeout(() => {
          if (newImages[newIndex]) {
            setBoxes(newImages[newIndex].boxes || [])
            setImageLoaded(true)
            drawBoxes()
          }
        }, 0)
      } else if (newImages.length > 0) {
        // Reset states before loading new image
        setImageLoaded(false)
        setBoxes([])
        setSelectedBoxId(null)
        setCurrentBox(null)
        setIsDrawing(false)
        
        setCurrentImageIndex(0)
        
        // Use timeout to ensure state updates before loading new image
        setTimeout(() => {
          if (newImages[0]) {
            setBoxes(newImages[0].boxes || [])
            setImageLoaded(true)
            drawBoxes()
          }
        }, 0)
      } else {
        setCurrentImageIndex(-1)
        setBoxes([])
        setImageLoaded(false)
      }
    } else if (index < currentImageIndex) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }

  // Modified export function to handle multiple images
  const exportToBoxFormat = () => {
    if (!currentImage || boxes.length === 0) return

    // Save current boxes before export
    const updatedImages = images.map((img, i) => 
      i === currentImageIndex ? { ...img, boxes } : img
    )

    // Create box file content
    const boxFileContent = boxes
      .map((box) => {
        if (!box.label) return null

        // Convert to Tesseract coordinates (origin at bottom-left)
        const left = Math.round(box.x)
        const bottom = Math.round(imageHeight - (box.y + box.height))
        const right = Math.round(box.x + box.width)
        const top = Math.round(imageHeight - box.y)

        return `${box.label} ${left} ${bottom} ${right} ${top} 0`
      })
      .filter(Boolean)
      .join("\n")

    // Get the original file name without extension
    const fileName = currentImage.file.name.replace(/\.[^/.]+$/, "")

    // Create and download the .box file
    const blob = new Blob([boxFileContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.box`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Update images state with saved boxes
    setImages(updatedImages)
  }

  // Add effect to maintain canvas dimensions
  useEffect(() => {
    if (imageLoaded && imageWidth && imageHeight && canvasRef.current) {
      console.log("Setting initial canvas dimensions:", imageWidth, "x", imageHeight)
      canvasRef.current.width = imageWidth
      canvasRef.current.height = imageHeight
      drawBoxes()
    }
  }, [imageWidth, imageHeight, imageLoaded, drawBoxes])

  // Redraw boxes when they change
  useEffect(() => {
    drawBoxes()
  }, [boxes, selectedBoxId, drawBoxes])

  // Clean up object URLs only when unmounting
  useEffect(() => {
    return () => {
      // Only cleanup URLs when component unmounts
      images.forEach(image => {
        URL.revokeObjectURL(image.url)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on unmount
  }, [])

  // Load boxes when changing images
  useEffect(() => {
    if (currentImage) {
      setBoxes(currentImage.boxes || [])
      setImageLoaded(true)
    } else {
      setBoxes([])
      setImageLoaded(false)
    }
  }, [currentImage])

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OCR Image Labeling Tool</CardTitle>
          <CardDescription>Create bounding boxes around characters and export them in Tesseract format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Images
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </Label>

                <Button
                  variant="outline"
                  onClick={goToPreviousImage}
                  disabled={currentImageIndex <= 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={goToNextImage}
                  disabled={currentImageIndex >= images.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>

                <span className="text-sm text-gray-500">
                  {images.length > 0 ? `Image ${currentImageIndex + 1} of ${images.length}` : "No images"}
                </span>

                <div className="flex-1" />

                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentBox(null)
                    setIsDrawing(false)
                    setSelectedBoxId(null)
                  }}
                  disabled={!imageLoaded}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Box
                </Button>

                <Button variant="outline" onClick={deleteSelectedBox} disabled={selectedBoxId === null}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Box
                </Button>

                <Button variant="outline" onClick={exportToBoxFormat} disabled={boxes.length === 0 || !imageLoaded}>
                  <Download className="mr-2 h-4 w-4" />
                  Export .box
                </Button>

                <Button
                  variant="outline"
                  onClick={() => removeImage(currentImageIndex)}
                  disabled={!imageLoaded}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Image
                </Button>
              </div>

              <div
                ref={containerRef}
                className="relative border rounded-md overflow-hidden bg-gray-100 dark:bg-neutral-900 flex items-center justify-center"
                style={{ height: "500px" }}
              >
                {error && (
                  <div className="text-center p-6 text-red-500">
                    <p>{error}</p>
                  </div>
                )}

                {!imageLoaded && !error ? (
                  <div className="text-center p-6 text-gray-500">
                    <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                    <p>Upload an image to begin labeling</p>
                  </div>
                ) : imageLoaded && imageUrl ? (
                  <div className="relative overflow-auto w-full h-full flex items-center justify-center">
                    <div style={{ position: "relative", width: "fit-content", height: "fit-content" }}>
                      {/* Background image for reference */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Uploaded image"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "500px",
                          width: "auto",
                          height: "auto",
                          display: "block"
                        }}
                      />

                      {/* Canvas for drawing boxes */}
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          cursor: isDrawing ? "crosshair" : "default",
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              {imageLoaded && (
                <div className="text-sm text-gray-500">
                  Image dimensions: {imageWidth} × {imageHeight} pixels | Boxes:{" "}
                  {boxes.length}
                  {debugInfo && <div className="mt-1 text-xs text-blue-500">{debugInfo}</div>}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Character Label</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Enter character"
                    value={boxes.find((box) => box.id === selectedBoxId)?.label || ""}
                    onChange={(e) => updateLabel(e.target.value)}
                    disabled={selectedBoxId === null}
                    maxLength={1}
                    className="w-16"
                  />
                  <span className="text-sm text-gray-500">
                    {selectedBoxId === null ? "Select a box to label" : "Enter a single character"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Bounding Boxes ({boxes.length})</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boxes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500">
                            No boxes created yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        boxes.map((box) => (
                          <TableRow
                            key={box.id}
                            className={selectedBoxId === box.id ? "bg-muted" : ""}
                            onClick={() => setSelectedBoxId(box.id)}
                          >
                            <TableCell className="font-medium">{box.label || "(unlabeled)"}</TableCell>
                            <TableCell>
                              x: {Math.round(box.x)}, y: {Math.round(box.y)}
                            </TableCell>
                            <TableCell>
                              {Math.round(box.width)} × {Math.round(box.height)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Instructions</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Upload an image containing text</li>
                  <li>Click and drag to create a bounding box around a character</li>
                  <li>Enter the character in the label field</li>
                  <li>Repeat for all characters in the image</li>
                  <li>Click &ldquo;Export .box&rdquo; to download the Tesseract box file</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          The exported .box file can be used with Tesseract OCR for training custom models
        </CardFooter>
      </Card>
    </div>
  )
}

