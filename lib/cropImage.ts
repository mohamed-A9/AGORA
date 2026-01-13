export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

/**
 * This function returns nothing because we are not cropping on the client side.
 * We are only using the crop coordinates to modify the Cloudinary URL.
 * However, react-easy-crop might expect us to use the pixels.
 * 
 * Ideally, we want to return the percent or pixel coordinates to the parent
 * so the parent can construct the Cloudinary URL.
 */
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
) {
    // We don't actually need to generate a blob here for Cloudinary cropping.
    // We just need the coordinates. 
    // But strictly speaking, the ImageCropper component doesn't call this.
    // Wait, I imported it in ImageCropper but didn't use it yet in `handleSave`.
    // Let's just export a helper to calculate coordinates if needed, 
    // or actually, since we are doing URL manipulation, we might not need a complex canvas cropper.

    // Actually, let's keep it simple: 
    // We will return the pixelCrop data directly from the component.
    // This file might be redundant if we don't do client-side cropping (canvas draw).
    // But let's provide a basic one just in case we need to verify the crop locally (optional).
    return null
}
